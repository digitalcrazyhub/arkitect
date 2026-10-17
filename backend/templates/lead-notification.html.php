<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * BUSINESS LEAD NOTIFICATION EMAIL TEMPLATE
 * File: backend/templates/lead-notification.html.php
 * ==============================================================================
 * Variables available in scope:
 * @var array $lead Lead data (full_name, email, phone, company, service_interested, project_location, message)
 * @var string $submissionTime Formatted date string
 * ==============================================================================
 */

use Arkitect\Utils\Security;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

$fullname  = Security::escapeHtml($lead['full_name']);
$email     = Security::escapeHtml($lead['email']);
$phone     = Security::escapeHtml($lead['phone']);
$company   = !empty($lead['company']) ? Security::escapeHtml($lead['company']) : '<em>Not specified</em>';
$service   = Security::escapeHtml($lead['service_interested']);
$location  = Security::escapeHtml($lead['project_location']);
$message   = nl2br(Security::escapeHtml($lead['message']));
$timeStr   = Security::escapeHtml($submissionTime ?? date('d M Y, h:i A T'));
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Enquiry | Artech Design</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FBF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1F1E1D; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; width: 100%; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #FBF9F5; padding: 32px 16px; }
    .main-card { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #DDD7CD; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(31, 30, 29, 0.04); }
    .header { background-color: #1F1E1D; padding: 28px 32px; border-bottom: 3px solid #6C4E31; text-align: left; }
    .brand-title { color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.04em; margin: 0; text-transform: uppercase; }
    .brand-sub { color: #DDD7CD; font-size: 12px; margin: 4px 0 0 0; letter-spacing: 0.02em; }
    .content { padding: 32px; }
    .heading { font-size: 18px; font-weight: 700; color: #1F1E1D; margin: 0 0 16px 0; border-bottom: 1px solid #EBE7E0; padding-bottom: 12px; }
    .intro-text { font-size: 14px; line-height: 1.6; color: #4A4846; margin: 0 0 24px 0; }
    .data-table { width: 100%; margin-bottom: 24px; border-collapse: separate; border-spacing: 0; }
    .data-table tr td { padding: 10px 12px; font-size: 14px; line-height: 1.5; border-bottom: 1px solid #F5EBE1; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-label { width: 38%; font-weight: 600; color: #6C4E31; vertical-align: top; background-color: #FBF9F5; }
    .data-value { width: 62%; color: #1F1E1D; vertical-align: top; background-color: #FFFFFF; }
    .message-box { background-color: #FBF9F5; border-left: 3px solid #6C4E31; padding: 16px 20px; margin-top: 16px; margin-bottom: 24px; border-radius: 0 6px 6px 0; font-size: 14px; line-height: 1.6; color: #1F1E1D; }
    .footer { background-color: #F5EBE1; padding: 24px 32px; text-align: center; border-top: 1px solid #DDD7CD; font-size: 12px; line-height: 1.6; color: #4A4846; }
    .footer strong { color: #1F1E1D; }
    .footer a { color: #6C4E31; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" class="main-card">
      <!-- Email Header -->
      <tr>
        <td class="header">
          <div class="brand-title">Artech Design</div>
          <div class="brand-sub">Aspirations Architects Engineers &bull; Est. 1990</div>
        </td>
      </tr>

      <!-- Email Content -->
      <tr>
        <td class="content">
          <h1 class="heading">New Website Architectural Enquiry</h1>
          <p class="intro-text">
            A new project enquiry has been submitted through the official website contact form at arkitect.in. The submitted details are summarized below:
          </p>

          <table role="presentation" class="data-table">
            <tr>
              <td class="data-label">Client Name:</td>
              <td class="data-value"><strong><?= $fullname ?></strong></td>
            </tr>
            <tr>
              <td class="data-label">Email Address:</td>
              <td class="data-value"><a href="mailto:<?= $email ?>" style="color: #6C4E31; text-decoration: underline;"><?= $email ?></a></td>
            </tr>
            <tr>
              <td class="data-label">Phone Number:</td>
              <td class="data-value"><a href="tel:<?= preg_replace('/[^0-9+]/', '', $lead['phone']) ?>" style="color: #1F1E1D; text-decoration: none;"><?= $phone ?></a></td>
            </tr>
            <tr>
              <td class="data-label">Company / Organisation:</td>
              <td class="data-value"><?= $company ?></td>
            </tr>
            <tr>
              <td class="data-label">Service of Interest:</td>
              <td class="data-value"><strong><?= $service ?> Architecture</strong></td>
            </tr>
            <tr>
              <td class="data-label">Project Location:</td>
              <td class="data-value"><?= $location ?></td>
            </tr>
            <tr>
              <td class="data-label">Submission Date &amp; Time:</td>
              <td class="data-value"><?= $timeStr ?></td>
            </tr>
          </table>

          <div style="font-weight: 600; font-size: 14px; color: #1F1E1D; margin-bottom: 6px;">
            Project Requirements / Message:
          </div>
          <div class="message-box">
            <?= $message ?>
          </div>

          <p style="font-size: 12px; color: #4A4846; margin: 16px 0 0 0; line-height: 1.5;">
            <em>Note: This message was generated automatically from the website enquiry dispatch system. You can reply directly to this email to contact <?= $fullname ?> (<a href="mailto:<?= $email ?>" style="color: #6C4E31;"><?= $email ?></a>).</em>
          </p>
        </td>
      </tr>

      <!-- Email Footer -->
      <tr>
        <td class="footer">
          <strong>Aspirations Architects Engineers</strong> (Artech Design)<br>
          New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033.<br>
          Telephone: 044 2481 8999 &bull; Email: <a href="mailto:aspirations@arkitect.in">aspirations@arkitect.in</a> &bull; Web: <a href="https://arkitect.in">arkitect.in</a>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
