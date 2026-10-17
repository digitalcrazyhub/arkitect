<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * SECURE CONTACT FORM API ENDPOINT (backend/api/contact.php)
 * ==============================================================================
 */

define('ARKITECT_BACKEND_LOADED', true);

require_once dirname(__DIR__) . '/config/bootstrap.php';

use Arkitect\Config\Env;
use Arkitect\Config\Database;
use Arkitect\Utils\Response;
use Arkitect\Utils\Security;
use Arkitect\Utils\Validation;
use Arkitect\Utils\RateLimiter;
use Arkitect\Services\RecaptchaService;
use Arkitect\Services\MailService;
use Arkitect\Services\GoogleSheetsService;

// 1. Enforce POST Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::methodNotAllowed();
}

// 2. Client IP Resolution & Security
$clientIp  = Security::getClientIp();
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// 3. Abuse Protection: Rate Limiting
$maxRequests   = Env::getInt('RATE_LIMIT_MAX_REQUESTS', 5);
$windowSeconds = Env::getInt('RATE_LIMIT_WINDOW_SECONDS', 600);

$rateCheck = RateLimiter::check($clientIp, $maxRequests, $windowSeconds);
if (!$rateCheck['allowed']) {
    $retryMinutes = ceil($rateCheck['retry_after'] / 60);
    arkitect_app_log('SECURITY', "Rate limit exceeded for IP {$clientIp}.", ['retry_after' => $rateCheck['retry_after']]);
    Response::rateLimited(
        "Too many enquiry attempts from your network. Please wait {$retryMinutes} minute(s) before trying again.",
        $rateCheck['retry_after']
    );
}

// 4. Parse Request Payload (Supports both FormData and JSON)
$rawInput = $_POST;
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (stripos($contentType, 'application/json') !== false) {
    $jsonRaw = file_get_contents('php://input');
    if (!empty($jsonRaw)) {
        $decodedJson = json_decode($jsonRaw, true);
        if (is_array($decodedJson)) {
            $rawInput = $decodedJson;
        } else {
            Response::badRequest('Malformed JSON payload received.');
        }
    }
}

// 5. Anti-Spam Honeypot Verification
// If the hidden 'website' field is populated, silently drop the submission
$honeypot = trim((string)($rawInput['website'] ?? ''));
if ($honeypot !== '') {
    arkitect_app_log('SPAM', "Honeypot triggered by IP {$clientIp}.", ['honeypot_value' => $honeypot]);
    // Return standard success response to deceive spambots without storing or emailing anything
    Response::success('Thank you for reaching out to Aspirations Architects Engineers. Your enquiry has been received successfully.');
}

// 6. Server-Side Input Validation
$validation = Validation::validateContactForm($rawInput);
if (!$validation['isValid']) {
    if (!empty($validation['isBot'])) {
        Response::success('Thank you for reaching out to Aspirations Architects Engineers. Your enquiry has been received successfully.');
    }
    Response::validationError('Please correct the highlighted form errors and try again.', $validation['errors']);
}

$cleanLead = $validation['data'];

// 7. Google reCAPTCHA v3 Server-Side Verification
$recaptchaToken = $cleanLead['recaptcha_token'] ?? '';
$recaptchaCheck = RecaptchaService::verify($recaptchaToken, $clientIp);

if (!$recaptchaCheck['success']) {
    Response::validationError(
        'Security verification could not be completed. Please refresh the page and try again.',
        ['recaptcha' => $recaptchaCheck['error'] ?? 'Verification failed']
    );
}

// 8. MySQL Lead Persistence (Prepared Statements)
$leadId = false;
try {
    $leadId = Database::insertLead($cleanLead, $clientIp, $userAgent);
    if ($leadId !== false) {
        arkitect_app_log('LEAD', "Lead successfully stored in database with ID {$leadId}.", ['email' => $cleanLead['email']]);
    }
} catch (\Throwable $dbException) {
    arkitect_app_log('DATABASE', 'Database persistence error: ' . $dbException->getMessage());
    // Do not fail completely if database is unconfigured or in maintenance; continue to email
}

// 9. Dispatch Internal Business Notification Email via PHPMailer
$emailNotificationSent = false;
try {
    $emailNotificationSent = MailService::sendLeadNotification($cleanLead);
} catch (\Throwable $mailException) {
    arkitect_app_log('MAIL', 'Business notification dispatch error: ' . $mailException->getMessage());
}

// 10. Dispatch Customer Acknowledgement Email via PHPMailer
$customerAckSent = false;
try {
    $customerAckSent = MailService::sendCustomerAcknowledgement($cleanLead);
} catch (\Throwable $ackException) {
    arkitect_app_log('MAIL', 'Customer acknowledgement dispatch error: ' . $ackException->getMessage());
}

// 11. Update Lead Statuses in Database (if lead was saved)
if ($leadId !== false) {
    Database::updateLeadStatuses($leadId, [
        'email_notification_status' => $emailNotificationSent ? 'sent' : 'failed',
        'customer_ack_status'       => $customerAckSent ? 'sent' : 'failed',
    ]);
}

// 12. Google Sheets Lead Synchronization (Append Row)
$sheetsResult = ['success' => false, 'status' => 'disabled'];
try {
    $sheetsResult = GoogleSheetsService::appendLead(
        $cleanLead,
        $leadId !== false ? (int)$leadId : null,
        $emailNotificationSent ? 'sent' : 'pending'
    );
    if ($leadId !== false && isset($sheetsResult['status'])) {
        Database::updateLeadStatuses($leadId, [
            'google_sheets_status' => $sheetsResult['status']
        ]);
    }
} catch (\Throwable $sheetsException) {
    arkitect_app_log('SHEETS', 'Google Sheets synchronization error: ' . $sheetsException->getMessage());
}

// 13. Audit Log Entry in backend/logs/enquiries.log (Safe JSON line without tokens/passwords)
$logDir = dirname(__DIR__) . '/logs';
$auditEntry = [
    'timestamp'       => date('Y-m-d H:i:s'),
    'ip'              => $clientIp,
    'full_name'       => $cleanLead['full_name'],
    'email'           => $cleanLead['email'],
    'phone'           => $cleanLead['phone'],
    'company'         => $cleanLead['company'],
    'service'         => $cleanLead['service_interested'],
    'location'        => $cleanLead['project_location'],
    'db_id'           => $leadId !== false ? $leadId : 'none',
    'notification'    => $emailNotificationSent ? 'sent' : 'failed/skipped',
    'customer_ack'    => $customerAckSent ? 'sent' : 'failed/skipped',
    'sheets_status'   => $sheetsResult['status'] ?? 'none'
];
@file_put_contents($logDir . '/enquiries.log', json_encode($auditEntry, JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX);

// 14. Return Professional Success Response to Client
// Never disclose database IDs, stack traces, or credentials to the browser
Response::success(
    'Thank you for reaching out to Aspirations Architects Engineers. Your enquiry has been received successfully. Our team will review your project requirements and get in touch with you shortly.'
);
