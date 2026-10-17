# Artech Design Website — Backend Architecture & Deployment Guide
### Aspirations Architects Engineers &bull; Secure Contact Form Backend

---

## 1. Overview
This backend provides an enterprise-grade, secure, multi-tier processing pipeline for the **Artech Design** website contact enquiry form.

### Processing Pipeline
1. **HTTP Method & Content Validation:** Rejects non-POST requests with HTTP 405.
2. **Abuse Protection & Rate Limiting:** Enforces IP-based rate limiting (5 requests per 10-minute window) using atomic file locking.
3. **Anti-Spam Honeypot:** Silently drops automated spambot submissions that populate the invisible `website` trap field.
4. **Server-Side Validation:** Validates full name, email format, phone syntax, service allowlist, location, message length, and privacy acknowledgement.
5. **Google reCAPTCHA v3:** Server-side token verification with action validation and score threshold checking.
6. **MySQL Persistence:** Safe parameter binding using PDO prepared statements to store leads with full UTF-8 (`utf8mb4`) support.
7. **Business Lead Notification (PHPMailer):** Sends an elegant, branded HTML email to `aspirations@arkitect.in` with a plain-text alternative.
8. **Customer Acknowledgement (PHPMailer):** Sends a personal, branded receipt confirmation to the customer without exposing internal database IDs or fabricating reference numbers.
9. **Status Updating:** Records email dispatch statuses in the database.
10. **Google Sheets Synchronization:** Appends the lead row to a shared Google Sheet via Service Account OAuth2 (with formula injection protection).
11. **Structured JSON Response:** Returns clean, accessible JSON status with appropriate HTTP status codes (200, 422, 429, 405, 500).

---

## 2. Server Requirements & Dependencies
- **PHP Version:** PHP 8.1 or higher (Tested on PHP 8.2.12).
- **Mandatory PHP Extensions:**
  - `pdo` & `pdo_mysql` (MySQL database connectivity)
  - `openssl` (JWT signing and TLS/SMTP encryption)
  - `curl` (Google reCAPTCHA & Sheets API communication)
  - `mbstring` (Multilingual UTF-8 string manipulation)
  - `json` (Payload parsing and serialization)
- **Composer:** Composer 2.x
  - `phpmailer/phpmailer`: Production SMTP email dispatch
  - `vlucas/phpdotenv`: Environment configuration parser

---

## 3. Directory Structure & Permissions

```text
backend/
├── api/
│   ├── contact.php              # Primary contact API endpoint (Callable over HTTP)
│   └── contact-submit.php       # Alias endpoint (Callable over HTTP)
├── config/
│   ├── bootstrap.php            # Core initialization, SPL autoloader, logging
│   ├── env.php                  # Strict .env loader and type casting
│   ├── database.php             # PDO connection and prepared statements
│   └── app.php                  # Legacy compatibility adapter
├── services/
│   ├── MailService.php          # PHPMailer dispatch (Notification & Acknowledgement)
│   ├── RecaptchaService.php     # Server-side Google reCAPTCHA v3 verification
│   └── GoogleSheetsService.php  # Service Account Google Sheets v4 row sync
├── utils/
│   ├── Response.php             # Standardized JSON response handler
│   ├── Security.php             # Sanitization, XSS, and injection prevention
│   ├── Validation.php           # Strict server-side input rules
│   ├── RateLimiter.php          # Atomic file-based rate limiter
│   └── helpers.php              # Legacy helper function adapter
├── templates/
│   ├── lead-notification.html.php       # Internal HTML email template
│   └── customer-acknowledgement.html.php # Customer HTML acknowledgement template
├── database/
│   └── schema.sql               # MySQL table structure and indexes
├── logs/
│   ├── enquiries.log            # Safe audit log (No secrets/tokens)
│   ├── app.log                  # Operational and diagnostic events
│   ├── rate_limit.json          # Active rate limiting state
│   └── .gitkeep
├── vendor/                      # Composer dependencies (Protected from HTTP access)
├── .htaccess                    # Strict Apache access restrictions
├── composer.json                # Composer configuration
├── .env.example                 # Production configuration template
└── README.md                    # This deployment guide
```

### File System Permissions (Linux / Apache)
```bash
# Set base directory permissions
chmod 755 backend
chmod 755 backend/api

# Protect private subdirectories
chmod 700 backend/config backend/services backend/utils backend/templates backend/database

# Writable directory for logs and rate limiter state
chmod 775 backend/logs
chmod 600 backend/.env
```

---

## 4. Environment Configuration (`.env`)

Copy `.env.example` to `.env` in the project root or inside `backend/`:
```bash
cp .env.example .env
```

### Configuration Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `APP_ENV` | Application environment (`development`, `staging`, `production`) | `development` |
| `APP_DEBUG` | Verbose logging toggle (never displays errors in HTTP responses) | `false` |
| `APP_TIMEZONE` | PHP timezone for timestamps | `Asia/Kolkata` |
| `APP_URL` | Public base URL of the website | `https://arkitect.in` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_DATABASE` | MySQL database name | `arkitect_db` |
| `DB_USERNAME` | Dedicated MySQL user | `arkitect_user` |
| `DB_PASSWORD` | Strong password for MySQL user | `[Generated Secure Password]` |
| `DB_CHARSET` | Character set | `utf8mb4` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_ENCRYPTION` | Encryption protocol (`tls` or `ssl`) | `tls` |
| `MAIL_USERNAME` | SMTP account username / email | `notifications@arkitect.in` |
| `MAIL_PASSWORD` | SMTP password / App Password | `[SMTP App Password]` |
| `MAIL_FROM_ADDRESS` | Authenticated From email address | `noreply@arkitect.in` |
| `MAIL_FROM_NAME` | Authenticated From sender name | `Artech Design` |
| `LEAD_NOTIFICATION_EMAIL` | Destination inbox for new leads | `aspirations@arkitect.in` |
| `MAIL_REPLY_TO_ADDRESS` | Customer email reply address | `aspirations@arkitect.in` |
| `RECAPTCHA_V3_SITE_KEY` | Public Google reCAPTCHA v3 site key | `[Obtained from Google Console]` |
| `RECAPTCHA_V3_SECRET_KEY` | Private Google reCAPTCHA v3 secret key | `[Obtained from Google Console]` |
| `RECAPTCHA_V3_MIN_SCORE` | Minimum acceptable bot threshold score | `0.5` |
| `RECAPTCHA_V3_EXPECTED_ACTION` | Expected action string verified by server | `contact_submit` |
| `GOOGLE_SHEETS_ENABLED` | Toggle Google Sheets synchronization | `false` |
| `GOOGLE_SHEETS_SPREADSHEET_ID`| ID of the destination spreadsheet | `[Found in Sheet URL]` |
| `GOOGLE_SHEETS_RANGE` | Sheet name and column range | `Leads!A:J` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`| Service account email address | `service-account@project.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | RSA Private Key for Service Account | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |
| `RATE_LIMIT_MAX_REQUESTS`| Max submissions per IP before throttling | `5` |
| `RATE_LIMIT_WINDOW_SECONDS`| Throttling time window in seconds | `600` (10 minutes) |

---

## 5. MySQL Database Setup

### 1. Create Database and Least-Privilege User
Log into MySQL as an administrative user and execute:
```sql
CREATE DATABASE IF NOT EXISTS `arkitect_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create dedicated least-privilege user
CREATE USER 'arkitect_user'@'localhost' IDENTIFIED BY 'YourStrongSecretPasswordHere!';

-- Grant strictly necessary privileges for contact form operations
GRANT SELECT, INSERT, UPDATE ON `arkitect_db`.* TO 'arkitect_user'@'localhost';

FLUSH PRIVILEGES;
```

### 2. Import Table Schema
Run the schema script:
```bash
mysql -u arkitect_user -p arkitect_db < backend/database/schema.sql
```

---

## 6. Google reCAPTCHA v3 Setup
1. Visit the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).
2. Register a new site with:
   - **Label:** Artech Design Website
   - **reCAPTCHA type:** reCAPTCHA v3
   - **Domains:** `arkitect.in` (and `localhost` for local staging)
3. Copy the **Site Key** and **Secret Key**.
4. Set `RECAPTCHA_V3_SITE_KEY` and `RECAPTCHA_V3_SECRET_KEY` in `.env`.
5. Add the site key to `contact.html` (or via `window.ARTECH_RECAPTCHA_KEY`).
6. *Development Note:* If `RECAPTCHA_V3_SECRET_KEY` is blank and `APP_ENV=development`, the backend gracefully allows submissions for testing while logging a notice.

---

## 7. Google Sheets Synchronization Setup
1. In the [Google Cloud Console](https://console.cloud.google.com/), create a new project.
2. Enable the **Google Sheets API**.
3. Create a **Service Account** under **IAM & Admin &gt; Service Accounts**.
4. Generate a new JSON key for the service account.
5. Create a Google Spreadsheet:
   - Add a sheet titled `Leads`.
   - Add headers in row 1:
     `A: Date | B: Full Name | C: Email | D: Phone | E: Company | F: Service | G: Location | H: Requirements | I: Lead ID | J: Email Status`
6. Click **Share** on the Google Sheet and invite the Service Account Email with **Editor** permissions.
7. In `.env`:
   - Set `GOOGLE_SHEETS_ENABLED=true`
   - Set `GOOGLE_SHEETS_SPREADSHEET_ID` (the string between `/d/` and `/edit` in your sheet URL).
   - Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
   - Set `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (pasting the full private key including headers).

---

## 8. Web Server Security (`.htaccess`)
Direct HTTP requests to private backend assets are blocked automatically via `backend/.htaccess`:
- Any requests for files ending in `.env`, `.log`, `.json`, `.sql`, `.md`, `.txt`, `.lock` receive HTTP 403 Forbidden.
- Direct web navigation to `config/`, `logs/`, `services/`, `utils/`, `templates/`, `database/`, and `vendor/` is forbidden.
- Only endpoints inside `backend/api/` (`contact.php` and `contact-submit.php`) are publicly executable.

---

## 9. Testing & Quality Verification

Run tests from the project root using PHP CLI:
```bash
# Verify syntax across all backend files
php -l backend/api/contact.php
php -l backend/config/bootstrap.php
php -l backend/config/database.php
php -l backend/services/MailService.php
php -l backend/services/RecaptchaService.php
php -l backend/services/GoogleSheetsService.php
```

---

## 10. Operational Monitoring & Recovery

- **Audit Log (`backend/logs/enquiries.log`):** Records timestamp, IP, submitted parameters, database insert status, and email statuses. Contains zero passwords, keys, or tokens.
- **Diagnostic Log (`backend/logs/app.log`):** Records operational warnings, connection timeouts, and integration exceptions.
- **Failed Integration Recovery:**
  - If a lead was successfully saved to MySQL but an email or Google Sheets synchronization failed, its status is marked as `'failed'` in the `enquiries` table (`email_notification_status` or `google_sheets_status`).
  - An administrator can query failed records:
    ```sql
    SELECT * FROM enquiries WHERE email_notification_status = 'failed' OR google_sheets_status = 'failed';
    ```
  - Leads can be manually reviewed or re-dispatched safely.
