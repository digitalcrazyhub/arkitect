<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * DATABASE CONNECTION & PERSISTENCE LAYER (backend/config/database.php)
 * ==============================================================================
 */

namespace Arkitect\Config;

use PDO;
use PDOException;
use Throwable;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class Database
{
    private static ?PDO $pdo = null;

    /**
     * Obtains a shared PDO instance configured with strict security and prepared statements.
     *
     * @return PDO|null Returns PDO if connected, null if database is unconfigured
     * @throws PDOException If connection fails and credentials were provided
     */
    public static function getConnection(): ?PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $host     = Env::get('DB_HOST', 'localhost');
        $port     = Env::getInt('DB_PORT', 3306);
        $dbname   = Env::get('DB_DATABASE', Env::get('DB_NAME', ''));
        $username = Env::get('DB_USERNAME', Env::get('DB_USER', ''));
        $password = Env::get('DB_PASSWORD', Env::get('DB_PASS', ''));
        $charset  = Env::get('DB_CHARSET', 'utf8mb4');

        // If no database name or user is configured, database integration is inactive
        if (empty($dbname) || empty($username)) {
            return null;
        }

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];

        try {
            self::$pdo = new PDO($dsn, $username, $password, $options);
            return self::$pdo;
        } catch (PDOException $e) {
            self::logError('Database Connection Failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Inserts a validated contact lead record into MySQL using prepared statements.
     *
     * @param array $lead Validated lead data
     * @param string $ip Client IP address
     * @param string $userAgent Client User-Agent string
     * @return int|false Returns the auto-increment lead ID on success, or false on failure
     */
    public static function insertLead(array $lead, string $ip, string $userAgent = '')
    {
        $pdo = self::getConnection();
        if (!$pdo) {
            return false;
        }

        $sql = "INSERT INTO enquiries (
            full_name,
            email,
            phone,
            company,
            service_interested,
            project_location,
            message,
            privacy_acknowledged,
            ip_address,
            user_agent,
            email_notification_status,
            customer_ack_status,
            google_sheets_status,
            created_at,
            updated_at
        ) VALUES (
            :full_name,
            :email,
            :phone,
            :company,
            :service_interested,
            :project_location,
            :message,
            :privacy_acknowledged,
            :ip_address,
            :user_agent,
            'pending',
            'pending',
            'pending',
            NOW(),
            NOW()
        )";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':full_name'            => $lead['full_name'],
                ':email'                => $lead['email'],
                ':phone'                => $lead['phone'],
                ':company'              => $lead['company'] ?: null,
                ':service_interested'   => $lead['service_interested'],
                ':project_location'     => $lead['project_location'],
                ':message'              => $lead['message'],
                ':privacy_acknowledged' => !empty($lead['privacy_acknowledged']) ? 1 : 0,
                ':ip_address'           => $ip,
                ':user_agent'           => mb_substr($userAgent, 0, 255)
            ]);

            return (int)$pdo->lastInsertId();
        } catch (Throwable $e) {
            self::logError('Lead Insertion Failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Updates delivery and synchronization statuses for a previously saved lead.
     *
     * @param int $leadId
     * @param array $statuses Associative array of column => status (e.g. ['email_notification_status' => 'sent'])
     * @return bool
     */
    public static function updateLeadStatuses(int $leadId, array $statuses): bool
    {
        $pdo = self::getConnection();
        if (!$pdo || $leadId <= 0 || empty($statuses)) {
            return false;
        }

        $allowedColumns = [
            'email_notification_status',
            'customer_ack_status',
            'google_sheets_status'
        ];

        $fields = [];
        $params = [':id' => $leadId];

        foreach ($statuses as $col => $val) {
            if (in_array($col, $allowedColumns, true)) {
                $fields[] = "`{$col}` = :{$col}";
                $params[":{$col}"] = (string)$val;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fieldsSql = implode(', ', $fields);
        $sql = "UPDATE enquiries SET {$fieldsSql}, updated_at = NOW() WHERE id = :id";

        try {
            $stmt = $pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (Throwable $e) {
            self::logError("Lead Status Update Failed for ID {$leadId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Logs database operational errors to backend/logs/app.log safely
     */
    private static function logError(string $message): void
    {
        $dir = dirname(__DIR__) . '/logs';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $logFile = $dir . '/app.log';
        $entry = '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
        @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }
}
