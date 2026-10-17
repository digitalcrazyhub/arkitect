<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * BACKEND UTILITIES & LEGACY HELPERS (backend/utils/helpers.php)
 * ==============================================================================
 */

if (!defined('ARKITECT_BACKEND_LOADED')) {
    define('ARKITECT_BACKEND_LOADED', true);
}

require_once dirname(__DIR__) . '/config/bootstrap.php';

use Arkitect\Utils\Security;
use Arkitect\Utils\RateLimiter;
use Arkitect\Config\Database;
use Arkitect\Services\MailService;

/**
 * Returns the sanitized IP address of the client.
 */
function arkitect_get_client_ip() {
    return Security::getClientIp();
}

/**
 * File-based rate limiter using IP addresses.
 */
function arkitect_check_rate_limit($ip, $maxAttempts = 5, $decayMinutes = 15) {
    $res = RateLimiter::check($ip, $maxAttempts, $decayMinutes * 60);
    return $res['allowed'];
}

/**
 * Securely logs enquiry submissions to backend/logs/enquiries.log
 */
function arkitect_log_enquiry($data) {
    $logsDir = dirname(__DIR__) . '/logs';
    if (!is_dir($logsDir)) {
        @mkdir($logsDir, 0755, true);
    }
    $logFile = $logsDir . '/enquiries.log';
    $entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip'        => $data['ip'] ?? Security::getClientIp(),
        'fullname'  => $data['fullname'] ?? $data['full_name'] ?? '',
        'email'     => $data['email'] ?? '',
        'phone'     => $data['phone'] ?? '',
        'company'   => $data['company'] ?? '',
        'service'   => $data['service'] ?? $data['service_interested'] ?? '',
        'location'  => $data['location'] ?? $data['project_location'] ?? '',
    ];
    @file_put_contents($logFile, json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

/**
 * Attempts database storage using PDO MySQL if credentials are provided in .env
 */
function arkitect_attempt_database_save($data) {
    $clean = [
        'full_name'            => $data['fullname'] ?? $data['full_name'] ?? '',
        'email'                => $data['email'] ?? '',
        'phone'                => $data['phone'] ?? '',
        'company'              => $data['company'] ?? '',
        'service_interested'   => $data['service'] ?? $data['service_interested'] ?? '',
        'project_location'     => $data['location'] ?? $data['project_location'] ?? '',
        'message'              => $data['message'] ?? '',
        'privacy_acknowledged' => true
    ];
    $ip = $data['ip'] ?? Security::getClientIp();
    $id = Database::insertLead($clean, $ip);
    return $id !== false;
}

/**
 * Attempts server-side notification email dispatch.
 */
function arkitect_attempt_email_notification($data) {
    $clean = [
        'full_name'            => $data['fullname'] ?? $data['full_name'] ?? '',
        'email'                => $data['email'] ?? '',
        'phone'                => $data['phone'] ?? '',
        'company'              => $data['company'] ?? '',
        'service_interested'   => $data['service'] ?? $data['service_interested'] ?? '',
        'project_location'     => $data['location'] ?? $data['project_location'] ?? '',
        'message'              => $data['message'] ?? '',
    ];
    return MailService::sendLeadNotification($clean);
}
