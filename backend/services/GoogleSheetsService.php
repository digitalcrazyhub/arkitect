<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * GOOGLE SHEETS LEAD SYNCHRONIZATION SERVICE (backend/services/GoogleSheetsService.php)
 * ==============================================================================
 */

namespace Arkitect\Services;

use Arkitect\Config\Env;
use Arkitect\Utils\Security;
use Throwable;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class GoogleSheetsService
{
    private const GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token';
    private const SHEETS_SCOPE     = 'https://www.googleapis.com/auth/spreadsheets';

    /**
     * Appends a new lead record to the configured Google Sheet.
     *
     * @param array $lead Validated lead data
     * @param int|null $leadId Internal MySQL lead ID
     * @param string $emailStatus Status of email notification ('sent', 'failed', 'pending')
     * @return array [ 'success' => bool, 'status' => string, 'error' => string|null ]
     */
    public static function appendLead(array $lead, ?int $leadId = null, string $emailStatus = 'pending'): array
    {
        $enabled = Env::getBool('GOOGLE_SHEETS_ENABLED', false);
        if (!$enabled) {
            return ['success' => false, 'status' => 'disabled', 'error' => 'Google Sheets integration is disabled in .env'];
        }

        $spreadsheetId = Env::get('GOOGLE_SHEETS_SPREADSHEET_ID', '');
        $range         = Env::get('GOOGLE_SHEETS_RANGE', 'Leads!A:J');
        $clientEmail   = Env::get('GOOGLE_SERVICE_ACCOUNT_EMAIL', '');
        $privateKey    = Env::get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', '');

        if (empty($spreadsheetId) || empty($clientEmail) || empty($privateKey)) {
            arkitect_app_log('SHEETS', 'Google Sheets enabled but credentials/spreadsheet ID are incomplete.');
            return ['success' => false, 'status' => 'unconfigured', 'error' => 'Missing Google Sheets credentials'];
        }

        // Format row values with Formula Injection protection
        $rowValues = [
            date('Y-m-d H:i:s'),
            Security::sanitizeForSpreadsheet($lead['full_name'] ?? ''),
            Security::sanitizeForSpreadsheet($lead['email'] ?? ''),
            Security::sanitizeForSpreadsheet($lead['phone'] ?? ''),
            Security::sanitizeForSpreadsheet($lead['company'] ?? ''),
            Security::sanitizeForSpreadsheet($lead['service_interested'] ?? ''),
            Security::sanitizeForSpreadsheet($lead['project_location'] ?? ''),
            Security::sanitizeForSpreadsheet($lead['message'] ?? ''),
            $leadId !== null ? (string)$leadId : '',
            $emailStatus
        ];

        try {
            // Check if official Google API Client is installed
            if (class_exists('Google\Client') && class_exists('Google\Service\Sheets')) {
                return self::appendViaGoogleClient($spreadsheetId, $range, $clientEmail, $privateKey, $rowValues);
            }

            // High-performance native Service Account REST API implementation
            return self::appendViaRestApi($spreadsheetId, $range, $clientEmail, $privateKey, $rowValues);
        } catch (Throwable $e) {
            arkitect_app_log('SHEETS', 'Exception during Google Sheets sync: ' . $e->getMessage());
            return ['success' => false, 'status' => 'failed', 'error' => 'Google Sheets service exception'];
        }
    }

    /**
     * Appends row using official Google API Client if installed via Composer
     */
    private static function appendViaGoogleClient(string $spreadsheetId, string $range, string $clientEmail, string $privateKey, array $rowValues): array
    {
        try {
            $client = new \Google\Client();
            $client->setAuthConfig([
                'type'         => 'service_account',
                'client_email' => $clientEmail,
                'private_key'  => $privateKey
            ]);
            $client->addScope(self::SHEETS_SCOPE);

            $service = new \Google\Service\Sheets($client);
            $body = new \Google\Service\Sheets\ValueRange([
                'values' => [$rowValues]
            ]);

            $params = ['valueInputOption' => 'USER_ENTERED'];
            $service->spreadsheets_values->append($spreadsheetId, $range, $body, $params);

            arkitect_app_log('SHEETS', 'Successfully synced lead row to Google Sheets via Google Client.');
            return ['success' => true, 'status' => 'synced', 'error' => null];
        } catch (Throwable $e) {
            arkitect_app_log('SHEETS', 'Google Client append error: ' . $e->getMessage());
            return ['success' => false, 'status' => 'failed', 'error' => 'Google Client error'];
        }
    }

    /**
     * Appends row using native Google Sheets REST v4 API and Service Account JWT Assertion
     */
    private static function appendViaRestApi(string $spreadsheetId, string $range, string $clientEmail, string $privateKey, array $rowValues): array
    {
        $accessToken = self::obtainServiceAccountToken($clientEmail, $privateKey);
        if (!$accessToken) {
            return ['success' => false, 'status' => 'failed', 'error' => 'Could not obtain Google OAuth2 access token'];
        }

        $encodedRange = urlencode($range);
        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$encodedRange}:append?valueInputOption=USER_ENTERED";

        $postPayload = json_encode([
            'range'          => $range,
            'majorDimension' => 'ROWS',
            'values'         => [$rowValues]
        ]);

        $headers = [
            "Authorization: Bearer {$accessToken}",
            "Content-Type: application/json"
        ];

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postPayload,
                CURLOPT_HTTPHEADER     => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                arkitect_app_log('SHEETS', 'Successfully synced lead row to Google Sheets via REST API.');
                return ['success' => true, 'status' => 'synced', 'error' => null];
            }

            arkitect_app_log('SHEETS', "Google Sheets API returned HTTP {$httpCode}.", ['response' => mb_substr((string)$response, 0, 300)]);
            return ['success' => false, 'status' => 'failed', 'error' => "HTTP {$httpCode} from Sheets API"];
        }

        return ['success' => false, 'status' => 'failed', 'error' => 'cURL extension required for Sheets sync'];
    }

    /**
     * Generates a signed OAuth2 JWT for Google Service Account authentication
     */
    private static function obtainServiceAccountToken(string $clientEmail, string $privateKey): ?string
    {
        $now = time();
        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $claimSet = [
            'iss'   => $clientEmail,
            'scope' => self::SHEETS_SCOPE,
            'aud'   => self::GOOGLE_TOKEN_URI,
            'exp'   => $now + 3600,
            'iat'   => $now
        ];

        $encodedHeader = self::base64UrlEncode(json_encode($header));
        $encodedClaim  = self::base64UrlEncode(json_encode($claimSet));
        $signatureInput = $encodedHeader . '.' . $encodedClaim;

        $binarySignature = '';
        $keyResource = openssl_pkey_get_private($privateKey);
        if (!$keyResource) {
            arkitect_app_log('SHEETS', 'Invalid private key format in GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.');
            return null;
        }

        $signed = openssl_sign($signatureInput, $binarySignature, $keyResource, OPENSSL_ALGO_SHA256);
        if (!$signed) {
            arkitect_app_log('SHEETS', 'OpenSSL failed to sign Google JWT assertion.');
            return null;
        }

        $assertion = $signatureInput . '.' . self::base64UrlEncode($binarySignature);

        // Exchange JWT assertion for OAuth2 access token
        $postData = http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $assertion
        ]);

        if (function_exists('curl_init')) {
            $ch = curl_init(self::GOOGLE_TOKEN_URI);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postData,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 8,
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            $tokenRes = curl_exec($ch);
            curl_close($ch);

            $tokenData = json_decode((string)$tokenRes, true);
            if (!empty($tokenData['access_token'])) {
                return $tokenData['access_token'];
            }

            arkitect_app_log('SHEETS', 'Google OAuth2 token exchange failed.', ['error' => $tokenData['error_description'] ?? 'Unknown']);
        }

        return null;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
