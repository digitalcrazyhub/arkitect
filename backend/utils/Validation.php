<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * SERVER-SIDE INPUT VALIDATION (backend/utils/Validation.php)
 * ==============================================================================
 */

namespace Arkitect\Utils;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class Validation
{
    /**
     * Permitted architectural sectors/verticals (strict allowlist)
     */
    public const ALLOWED_SERVICES = [
        'Healthcare',
        'Residential',
        'Commercial',
        'Hospitality',
        'Industrial',
        'Institutional',
        'Other'
    ];

    /**
     * Validates and sanitizes raw contact form submission payload.
     *
     * @param array $rawInput
     * @return array Array with keys: isValid (bool), errors (array), data (array), isBot (bool)
     */
    public static function validateContactForm(array $rawInput): array
    {
        $errors = [];
        $clean = [];

        // 1. Anti-Spam Honeypot Verification
        // The hidden field named "website" must be left empty by legitimate humans
        $websiteHoneypot = isset($rawInput['website']) ? trim((string)$rawInput['website']) : '';
        if ($websiteHoneypot !== '') {
            return [
                'isValid' => false,
                'isBot'   => true,
                'errors'  => ['website' => 'Bot submission detected.'],
                'data'    => []
            ];
        }

        // Extract raw inputs
        $fullname = isset($rawInput['fullname']) ? Security::sanitizeString((string)$rawInput['fullname'], 120) : '';
        $email    = isset($rawInput['email']) ? Security::preventEmailHeaderInjection(trim((string)$rawInput['email'])) : '';
        $phone    = isset($rawInput['phone']) ? Security::preventEmailHeaderInjection(trim((string)$rawInput['phone'])) : '';
        $company  = isset($rawInput['company']) ? Security::sanitizeString((string)$rawInput['company'], 150) : '';
        $service  = isset($rawInput['service']) ? trim((string)$rawInput['service']) : '';
        $location = isset($rawInput['location']) ? Security::sanitizeString((string)$rawInput['location'], 150) : '';
        $message  = isset($rawInput['message']) ? Security::sanitizeString((string)$rawInput['message'], 3500) : '';
        $privacy  = isset($rawInput['privacy']) ? trim((string)$rawInput['privacy']) : '';
        $recaptchaToken = $rawInput['g-recaptcha-response'] ?? $rawInput['recaptcha_token'] ?? '';

        // Validation Rule 1: Full Name
        if ($fullname === '') {
            $errors['fullname'] = 'Please enter your full name.';
        } elseif (mb_strlen($fullname) < 2) {
            $errors['fullname'] = 'Full name must be at least 2 characters.';
        } elseif (mb_strlen($fullname) > 100) {
            $errors['fullname'] = 'Full name cannot exceed 100 characters.';
        }

        // Validation Rule 2: Email Address
        if ($email === '') {
            $errors['email'] = 'Please enter your email address.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address (e.g., name@example.com).';
        } elseif (mb_strlen($email) > 120) {
            $errors['email'] = 'Email address cannot exceed 120 characters.';
        }

        // Validation Rule 3: Contact Phone Number
        $digitsOnly = preg_replace('/[^0-9]/', '', $phone);
        if ($phone === '') {
            $errors['phone'] = 'Please enter your contact phone number.';
        } elseif (strlen($digitsOnly) < 7 || strlen($digitsOnly) > 16 || !preg_match('~^[+]?[0-9\s().\/-]{7,25}$~', $phone)) {
            $errors['phone'] = 'Please enter a valid phone number (e.g. 044 2481 8999 or +91 98400 12345).';
        }

        // Validation Rule 4: Company / Organisation (Optional, max 120)
        if (mb_strlen($company) > 120) {
            $errors['company'] = 'Company name cannot exceed 120 characters.';
        }

        // Validation Rule 5: Architectural Service of Interest
        if ($service === '') {
            $errors['service'] = 'Please select the architectural service you are interested in.';
        } elseif (!in_array($service, self::ALLOWED_SERVICES, true)) {
            $errors['service'] = 'Please select a valid architectural service category.';
        }

        // Validation Rule 6: Project Location
        if ($location === '') {
            $errors['location'] = 'Please enter the project location.';
        } elseif (mb_strlen($location) < 2) {
            $errors['location'] = 'Project location must be at least 2 characters.';
        } elseif (mb_strlen($location) > 120) {
            $errors['location'] = 'Project location cannot exceed 120 characters.';
        }

        // Validation Rule 7: Project Requirements / Message
        if ($message === '') {
            $errors['message'] = 'Please provide details about your project requirements or message.';
        } elseif (mb_strlen($message) < 10) {
            $errors['message'] = 'Please provide at least 10 characters describing your project requirements.';
        } elseif (mb_strlen($message) > 3000) {
            $errors['message'] = 'Project requirements cannot exceed 3000 characters.';
        }

        // Validation Rule 8: Privacy Acknowledgement Checkbox
        if ($privacy !== '1' && $privacy !== 'true' && $privacy !== 'on') {
            $errors['privacy'] = 'You must acknowledge the privacy notice to submit your enquiry.';
        }

        $clean = [
            'full_name'            => $fullname,
            'email'                => strtolower($email),
            'phone'                => $phone,
            'company'              => $company,
            'service_interested'   => $service,
            'project_location'     => $location,
            'message'              => $message,
            'privacy_acknowledged' => true,
            'recaptcha_token'      => trim((string)$recaptchaToken)
        ];

        return [
            'isValid' => empty($errors),
            'isBot'   => false,
            'errors'  => $errors,
            'data'    => $clean
        ];
    }
}
