<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * GOOGLE RECAPTCHA V3 VERIFICATION SERVICE (backend/services/RecaptchaService.php)
 * ==============================================================================
 */

namespace Arkitect\Services;

use Arkitect\Config\Env;
use Arkitect\Utils\Security;
use Throwable;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class RecaptchaService
{
    private const VERIFY_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify';

    /**
     * Verifies a reCAPTCHA v3 token with Google's verification servers.
     *
     * @param string $token
     * @param string $clientIp
     * @return array [ 'success' => bool, 'score' => float|null, 'error' => string|null ]
     */
    public static function verify(string $token, string $clientIp): array
    {
        $secretKey      = Env::get('RECAPTCHA_V3_SECRET_KEY', '');
        $expectedAction = Env::get('RECAPTCHA_V3_EXPECTED_ACTION', 'contact_submit');
        $minScore       = (float)Env::get('RECAPTCHA_V3_MIN_SCORE', 0.5);

        // If no secret key is configured:
        // In development/testing mode: allow bypass with logged audit notice.
        // In production mode: fail closed.
        if (empty($secretKey)) {
            if (!Env::isProduction()) {
                arkitect_app_log('RECAPTCHA', 'Bypassed: RECAPTCHA_V3_SECRET_KEY is empty in non-production environment.');
                return ['success' => true, 'score' => 1.0, 'error' => null];
            }

            arkitect_app_log('RECAPTCHA', 'Failed: RECAPTCHA_V3_SECRET_KEY missing in production environment.');
            return ['success' => false, 'score' => 0.0, 'error' => 'reCAPTCHA configuration error.'];
        }

        if (empty($token)) {
            arkitect_app_log('RECAPTCHA', 'Verification rejected: Empty token submitted.', ['ip' => $clientIp]);
            return ['success' => false, 'score' => 0.0, 'error' => 'Missing reCAPTCHA verification token.'];
        }

        $postData = http_build_query([
            'secret'   => $secretKey,
            'response' => $token,
            'remoteip' => $clientIp
        ]);

        try {
            $response = self::executeVerificationRequest($postData);
            if ($response === false) {
                arkitect_app_log('RECAPTCHA', 'Network error reaching Google reCAPTCHA endpoint.');
                // Fail closed on network failure
                return ['success' => false, 'score' => 0.0, 'error' => 'reCAPTCHA verification network error.'];
            }

            $result = json_decode($response, true);
            if (!is_array($result)) {
                arkitect_app_log('RECAPTCHA', 'Invalid JSON returned from Google verification.');
                return ['success' => false, 'score' => 0.0, 'error' => 'reCAPTCHA invalid server response.'];
            }

            // Check Google success flag
            $success = !empty($result['success']);
            $score   = isset($result['score']) ? (float)$result['score'] : 0.0;
            $action  = $result['action'] ?? '';

            if (!$success) {
                $errorCodes = $result['error-codes'] ?? [];
                arkitect_app_log('RECAPTCHA', 'Verification rejected by Google.', [
                    'errors' => $errorCodes,
                    'ip'     => $clientIp
                ]);
                return ['success' => false, 'score' => $score, 'error' => 'reCAPTCHA verification failed.'];
            }

            // Verify action parameter matches expected
            if (!empty($expectedAction) && $action !== $expectedAction) {
                arkitect_app_log('RECAPTCHA', "Action mismatch: expected '{$expectedAction}', received '{$action}'.", [
                    'ip' => $clientIp
                ]);
                return ['success' => false, 'score' => $score, 'error' => 'reCAPTCHA action mismatch.'];
            }

            // Verify score threshold
            if ($score < $minScore) {
                arkitect_app_log('RECAPTCHA', "Score too low: {$score} (minimum required: {$minScore}).", [
                    'ip' => $clientIp
                ]);
                return ['success' => false, 'score' => $score, 'error' => 'reCAPTCHA score below acceptable threshold.'];
            }

            arkitect_app_log('RECAPTCHA', "Verification successful. Score: {$score}.", ['ip' => $clientIp]);
            return ['success' => true, 'score' => $score, 'error' => null];

        } catch (Throwable $e) {
            arkitect_app_log('RECAPTCHA', 'Unexpected error: ' . $e->getMessage());
            return ['success' => false, 'score' => 0.0, 'error' => 'reCAPTCHA service exception.'];
        }
    }

    /**
     * Executes HTTP POST request to Google verification server with timeouts.
     */
    private static function executeVerificationRequest(string $postData)
    {
        if (function_exists('curl_init')) {
            $ch = curl_init(self::VERIFY_ENDPOINT);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $postData,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_USERAGENT      => 'ArtechDesign-Backend/1.0'
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            return $response;
        }

        // Fallback to file_get_contents with stream context
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n" .
                             "User-Agent: ArtechDesign-Backend/1.0\r\n",
                'content' => $postData,
                'timeout' => 10,
            ],
            'ssl' => [
                'verify_peer'      => true,
                'verify_peer_name' => true,
            ]
        ];
        $context = stream_context_create($opts);
        return @file_get_contents(self::VERIFY_ENDPOINT, false, $context);
    }
}
