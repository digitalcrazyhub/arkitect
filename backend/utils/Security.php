<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * BACKEND SECURITY & SANITIZATION UTILITIES (backend/utils/Security.php)
 * ==============================================================================
 */

namespace Arkitect\Utils;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class Security
{
    /**
     * Sanitizes a general string input by trimming, stripping null bytes and control chars.
     *
     * @param string $input
     * @param int $maxLength Optional max length to truncate
     * @return string
     */
    public static function sanitizeString(string $input, int $maxLength = 0): string
    {
        // Strip null bytes and non-printable control characters (except linebreaks \r \n \t)
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $input);
        $clean = trim((string)$clean);

        if ($maxLength > 0 && mb_strlen($clean) > $maxLength) {
            $clean = mb_substr($clean, 0, $maxLength);
        }

        return $clean;
    }

    /**
     * Contextual HTML output escaping to prevent Cross-Site Scripting (XSS).
     *
     * @param string $string
     * @return string
     */
    public static function escapeHtml(string $string): string
    {
        return htmlspecialchars($string, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * Neutralizes Formula Injection attacks for CSV and Google Sheets exports.
     * Prevents execution of malicious formulas starting with =, +, -, @, tab, or carriage return.
     *
     * @param string $value
     * @return string
     */
    public static function sanitizeForSpreadsheet(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        $dangerousPrefixes = ['=', '+', '-', '@', "\t", "\r"];
        $firstChar = substr($value, 0, 1);

        if (in_array($firstChar, $dangerousPrefixes, true)) {
            // Prepend a single quote to force spreadsheet programs to treat it as plain text
            return "'" . $value;
        }

        return $value;
    }

    /**
     * Defends against Email Header Injection by stripping CRLF and header commands.
     *
     * @param string $value
     * @return string
     */
    public static function preventEmailHeaderInjection(string $value): string
    {
        // Remove line breaks and url-encoded CRLF sequences
        $clean = str_ireplace(["\r", "\n", "%0a", "%0d", "content-type:", "bcc:", "cc:", "to:"], '', $value);
        return trim($clean);
    }

    /**
     * Resolves client IP address securely.
     * Avoids blindly trusting X-Forwarded-For unless explicitly configured.
     *
     * @param array $trustedProxies Optional array of trusted proxy IPs
     * @return string Validated IP address
     */
    public static function getClientIp(array $trustedProxies = []): string
    {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        // Normalize IPv6 localhost
        if ($remoteAddr === '::1') {
            $remoteAddr = '127.0.0.1';
        }

        // Only inspect X-Forwarded-For if REMOTE_ADDR is in trusted proxies
        if (!empty($trustedProxies) && in_array($remoteAddr, $trustedProxies, true)) {
            if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
                $clientIp = trim($ips[0]);
                if (filter_var($clientIp, FILTER_VALIDATE_IP)) {
                    return $clientIp;
                }
            }
        }

        return filter_var($remoteAddr, FILTER_VALIDATE_IP) ? $remoteAddr : '127.0.0.1';
    }

    /**
     * Safely masks a sensitive secret (e.g. API keys) for error logs.
     *
     * @param string $secret
     * @param int $visibleEndChars
     * @return string
     */
    public static function maskSecret(string $secret, int $visibleEndChars = 4): string
    {
        $len = strlen($secret);
        if ($len <= $visibleEndChars) {
            return '****';
        }
        return str_repeat('*', max(4, $len - $visibleEndChars)) . substr($secret, -$visibleEndChars);
    }
}
