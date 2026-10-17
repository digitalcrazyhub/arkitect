<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * EMAIL DISPATCH SERVICE VIA PHPMAILER (backend/services/MailService.php)
 * ==============================================================================
 */

namespace Arkitect\Services;

use Arkitect\Config\Env;
use Arkitect\Utils\Security;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Throwable;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class MailService
{
    /**
     * Sends the internal business lead notification to the studio inbox.
     *
     * @param array $lead Validated lead data
     * @return bool True if accepted by mail transport, false otherwise
     */
    public static function sendLeadNotification(array $lead): bool
    {
        $recipientEmail = Env::get('LEAD_NOTIFICATION_EMAIL', Env::get('CONTACT_RECEIVER_EMAIL', 'aspirations@arkitect.in'));
        $subject        = 'New Website Enquiry | Artech Design';
        $submissionTime = date('d M Y, h:i A T');

        // Render HTML Email Template
        $htmlBody = self::renderTemplate(
            dirname(__DIR__) . '/templates/lead-notification.html.php',
            ['lead' => $lead, 'submissionTime' => $submissionTime]
        );

        // Generate Plain-Text Alternative
        $plainText = self::generateLeadNotificationPlainText($lead, $submissionTime);

        return self::dispatchMail(
            $recipientEmail,
            'Artech Design Studio Office',
            $subject,
            $htmlBody,
            $plainText,
            $lead['email'],
            $lead['full_name']
        );
    }

    /**
     * Sends the customer acknowledgement email confirming enquiry receipt.
     *
     * @param array $lead Validated lead data
     * @return bool True if accepted by mail transport, false otherwise
     */
    public static function sendCustomerAcknowledgement(array $lead): bool
    {
        $subject        = 'Thank You for Contacting Artech Design';
        $submissionTime = date('d M Y, h:i A T');

        // Render HTML Email Template
        $htmlBody = self::renderTemplate(
            dirname(__DIR__) . '/templates/customer-acknowledgement.html.php',
            ['lead' => $lead, 'submissionTime' => $submissionTime]
        );

        // Generate Plain-Text Alternative
        $plainText = self::generateCustomerAcknowledgementPlainText($lead);

        $replyToEmail = Env::get('MAIL_REPLY_TO_ADDRESS', Env::get('LEAD_NOTIFICATION_EMAIL', 'aspirations@arkitect.in'));

        return self::dispatchMail(
            $lead['email'],
            $lead['full_name'],
            $subject,
            $htmlBody,
            $plainText,
            $replyToEmail,
            'Artech Design'
        );
    }

    /**
     * Creates and dispatches an email via PHPMailer with SMTP authentication.
     */
    private static function dispatchMail(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody,
        string $plainText,
        string $replyToEmail = '',
        string $replyToName = ''
    ): bool {
        // Check if PHPMailer is available
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            arkitect_app_log('MAIL', 'PHPMailer class not found. Please run composer install.');
            return false;
        }

        $host     = Env::get('MAIL_HOST', Env::get('SMTP_HOST', ''));
        $port     = Env::getInt('MAIL_PORT', Env::getInt('SMTP_PORT', 587));
        $secure   = strtolower((string)Env::get('MAIL_ENCRYPTION', Env::get('SMTP_SECURE', 'tls')));
        $username = Env::get('MAIL_USERNAME', Env::get('SMTP_USER', ''));
        $password = Env::get('MAIL_PASSWORD', Env::get('SMTP_PASS', ''));

        $fromAddress = Env::get('MAIL_FROM_ADDRESS', Env::get('SMTP_FROM_EMAIL', 'noreply@arkitect.in'));
        $fromName    = Env::get('MAIL_FROM_NAME', Env::get('SMTP_FROM_NAME', 'Artech Design'));

        // If no SMTP host is configured, log notice and skip live transmission
        if (empty($host) || empty($username)) {
            arkitect_app_log('MAIL', 'SMTP credentials unconfigured. Skipping live email dispatch.', [
                'recipient' => $toEmail,
                'subject'   => $subject
            ]);
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            // Server configuration
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->SMTPAuth   = !empty($username);
            $mail->Username   = $username;
            $mail->Password   = $password;
            $mail->Port       = $port;
            $mail->CharSet    = 'UTF-8';
            $mail->Timeout    = 10;

            if ($secure === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($secure === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } else {
                $mail->SMTPSecure = '';
                $mail->SMTPAutoTLS = false;
            }

            // Sender and Recipient
            $cleanFromAddress = Security::preventEmailHeaderInjection($fromAddress);
            $cleanFromName    = Security::preventEmailHeaderInjection($fromName);
            $cleanToEmail     = Security::preventEmailHeaderInjection($toEmail);
            $cleanToName      = Security::preventEmailHeaderInjection($toName);

            $mail->setFrom($cleanFromAddress, $cleanFromName);
            $mail->addAddress($cleanToEmail, $cleanToName);

            if (!empty($replyToEmail)) {
                $cleanReplyToEmail = Security::preventEmailHeaderInjection($replyToEmail);
                $cleanReplyToName  = Security::preventEmailHeaderInjection($replyToName);
                $mail->addReplyTo($cleanReplyToEmail, $cleanReplyToName);
            }

            // Content
            $mail->isHTML(true);
            $mail->Subject = Security::preventEmailHeaderInjection($subject);
            $mail->Body    = $htmlBody;
            $mail->AltBody = $plainText;

            $mail->send();
            arkitect_app_log('MAIL', 'Email successfully dispatched.', [
                'recipient' => $cleanToEmail,
                'subject'   => $subject
            ]);
            return true;
        } catch (PHPMailerException $e) {
            arkitect_app_log('MAIL', 'PHPMailer error: ' . $e->getMessage(), [
                'recipient' => $toEmail,
                'subject'   => $subject
            ]);
            return false;
        } catch (Throwable $e) {
            arkitect_app_log('MAIL', 'Unexpected mail error: ' . $e->getMessage(), [
                'recipient' => $toEmail,
                'subject'   => $subject
            ]);
            return false;
        }
    }

    /**
     * Renders a PHP view template into an output string.
     */
    private static function renderTemplate(string $filePath, array $vars = []): string
    {
        if (!file_exists($filePath)) {
            return '';
        }

        extract($vars, EXTR_SKIP);
        ob_start();
        include $filePath;
        return ob_get_clean() ?: '';
    }

    /**
     * Generates a plain-text version for the internal lead notification.
     */
    private static function generateLeadNotificationPlainText(array $lead, string $timeStr): string
    {
        $lines = [
            "ARTECH DESIGN (Aspirations Architects Engineers)",
            "NEW WEBSITE ARCHITECTURAL ENQUIRY",
            str_repeat('=', 50),
            "Full Name: " . $lead['full_name'],
            "Email: " . $lead['email'],
            "Phone: " . $lead['phone'],
            "Company: " . ($lead['company'] ?: 'Not specified'),
            "Service of Interest: " . $lead['service_interested'] . " Architecture",
            "Project Location: " . $lead['project_location'],
            "Submission Date: " . $timeStr,
            str_repeat('-', 50),
            "PROJECT REQUIREMENTS / MESSAGE:",
            $lead['message'],
            str_repeat('=', 50),
            "Studio Office: New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033.",
            "Phone: 044 2481 8999 | Email: aspirations@arkitect.in"
        ];
        return implode("\n", $lines);
    }

    /**
     * Generates a plain-text version for the customer acknowledgement.
     */
    private static function generateCustomerAcknowledgementPlainText(array $lead): string
    {
        $lines = [
            "ARTECH DESIGN (Aspirations Architects Engineers)",
            "THANK YOU FOR CONTACTING ARTECH DESIGN",
            str_repeat('=', 50),
            "Dear " . $lead['full_name'] . ",",
            "",
            "Thank you for reaching out to Artech Design. We have received your enquiry and appreciate your interest in our architectural services. Our team will review the information you provided and follow up as appropriate.",
            "",
            "ENQUIRY SUMMARY:",
            "- Service of Interest: " . $lead['service_interested'] . " Architecture",
            "- Project Location: " . $lead['project_location'],
            "",
            "If you have additional drawings or site information to share, you may email us directly at aspirations@arkitect.in or call 044 2481 8999.",
            "",
            "Warm regards,",
            "Principal Design Team",
            "Artech Design | Aspirations Architects Engineers",
            "New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033."
        ];
        return implode("\n", $lines);
    }
}
