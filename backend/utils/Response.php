<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * JSON RESPONSE UTILITY (backend/utils/Response.php)
 * ==============================================================================
 */

namespace Arkitect\Utils;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class Response
{
    /**
     * Sends a standardized JSON response with security headers and terminates execution.
     *
     * @param bool $success
     * @param string $message
     * @param array $data
     * @param int $statusCode
     * @return void
     */
    public static function json(bool $success, string $message, array $data = [], int $statusCode = 200): void
    {
        // Suppress any accidental output buffers to ensure valid JSON payload
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');

        $payload = array_merge([
            'success' => $success,
            'message' => $message,
        ], $data);

        echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Convenience method for HTTP 200 Success responses
     */
    public static function success(string $message, array $data = []): void
    {
        self::json(true, $message, $data, 200);
    }

    /**
     * Convenience method for HTTP 422 Unprocessable Entity (Validation Failures)
     */
    public static function validationError(string $message, array $errors = []): void
    {
        self::json(false, $message, ['errors' => $errors], 422);
    }

    /**
     * Convenience method for HTTP 429 Too Many Requests (Rate Limiting)
     */
    public static function rateLimited(string $message, int $retryAfterSeconds = 600): void
    {
        header("Retry-After: {$retryAfterSeconds}");
        self::json(false, $message, ['retry_after' => $retryAfterSeconds], 429);
    }

    /**
     * Convenience method for HTTP 405 Method Not Allowed
     */
    public static function methodNotAllowed(string $message = 'Method Not Allowed. Only POST requests are accepted.'): void
    {
        header('Allow: POST');
        self::json(false, $message, [], 405);
    }

    /**
     * Convenience method for HTTP 400 Bad Request
     */
    public static function badRequest(string $message = 'Bad Request. Invalid or malformed payload.'): void
    {
        self::json(false, $message, [], 400);
    }

    /**
     * Convenience method for HTTP 500 Server Error (Safe message, no stack trace)
     */
    public static function serverError(string $message = 'An unexpected error occurred while processing your enquiry. Please reach out directly to aspirations@arkitect.in or 044 2481 8999.'): void
    {
        self::json(false, $message, [], 500);
    }
}
