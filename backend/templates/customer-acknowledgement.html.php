<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * CUSTOMER ACKNOWLEDGEMENT EMAIL TEMPLATE
 * File: backend/templates/customer-acknowledgement.html.php
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

$fullname = Security::escapeHtml($lead['full_name']);
$service  = Security::escapeHtml($lead['service_interested']);
$location = Security::escapeHtml($lead['project_location']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Artech Design</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FBF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1F1E1D; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; width: 100%; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #FBF9F5; padding: 32px 16px; }
    .main-card { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #DDD7CD; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(31, 30, 29, 0.04); }
    .header { background-color: #1F1E1D; padding: 28px 32px; border-bottom: 3px solid #6C4E31; text-align: left; }
    .brand-title { color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.04em; margin: 0; text-transform: uppercase; }
    .brand-sub { color: #DDD7CD; font-size: 12px; margin: 4px 0 0 0; letter-spacing: 0.02em; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #4A4846; }
    .heading { font-size: 18px; font-weight: 700; color: #1F1E1D; margin: 0 0 16px 0; border-bottom: 1px solid #EBE7E0; padding-bottom: 12px; }
    .summary-card { background-color: #FBF9F5; border: 1px solid #EBE7E0; border-left: 3px solid #6C4E31; border-radius: 0 6px 6px 0; padding: 16px 20px; margin: 24px 0; }
    .summary-row { margin: 4px 0; font-size: 14px; }
    .summary-label { font-weight: 600; color: #6C4E31; }
    .summary-val { color: #1F1E1D; }
    .contact-box { background-color: #F5EBE1; border-radius: 6px; padding: 18px 20px; margin-top: 24px; font-size: 13px; line-height: 1.6; color: #4A4846; }
    .contact-box strong { color: #1F1E1D; }
    .contact-box a { color: #6C4E31; text-decoration: underline; }
    .signoff { margin-top: 24px; font-size: 14px; line-height: 1.6; color: #1F1E1D; }
    .footer { background-color: #FBF9F5; padding: 20px 32px; text-align: center; border-top: 1px solid #DDD7CD; font-size: 12px; line-height: 1.6; color: #4A4846; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" class="main-card">
      <!-- Header -->
      <tr>
        <td class="header">
          <div class="brand-title">Artech Design</div>
          <div class="brand-sub">Aspirations Architects Engineers &bull; Est. 1990</div>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td class="content">
          <h1 class="heading">Thank You for Reaching Out</h1>
          
          <p style="margin-top: 0;">
            Dear <?= $fullname ?>,
          </p>

          <p>
            Thank you for reaching out to Artech Design. We have received your enquiry and appreciate your interest in our architectural services. Our team will review the information you provided and follow up as appropriate.
          </p>

          <div class="summary-card">
            <div style="font-weight: 700; font-size: 14px; color: #1F1E1D; margin-bottom: 8px;">Enquiry Summary</div>
            <div class="summary-row">
              <span class="summary-label">Service of Interest:</span>
              <span class="summary-val"><?= $service ?> Architecture</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Project Location:</span>
              <span class="summary-val"><?= $location ?></span>
            </div>
          </div>

          <p>
            Should you need to provide additional architectural drawings, municipal sanction documents, or site layout plans in the interim, please feel free to email our studio directly or give us a call.
          </p>

          <div class="contact-box">
            <strong>Studio Office &bull; Aspirations Architects Engineers</strong><br>
            New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033.<br>
            Telephone: <a href="tel:04424818999" style="color: #6C4E31; text-decoration: none;">044 2481 8999</a> &bull; Email: <a href="mailto:aspirations@arkitect.in">aspirations@arkitect.in</a>
          </div>

          <div class="signoff">
            Warm regards,<br>
            <strong>Principal Design Team</strong><br>
            Artech Design &bull; Aspirations Architects Engineers
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          &copy; <?= date('Y') ?> Aspirations Architects Engineers. All rights reserved.<br>
          Practicing Architecture Since 1990 in Chennai, Tamil Nadu, India.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
