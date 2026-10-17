<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * ENVIRONMENT LOADER & CONFIGURATION (backend/config/env.php)
 * ==============================================================================
 */

namespace Arkitect\Config;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class Env
{
    private static bool $loaded = false;

    /**
     * Loads .env file safely without eval() or exposing secrets
     */
    public static function load(): void
    {
        if (self::$loaded) {
            return;
        }

        // Check backend/.env first, then root .env
        $backendEnv = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
        $rootEnv    = dirname(dirname(__DIR__)) . DIRECTORY_SEPARATOR . '.env';

        $envFile = file_exists($backendEnv) ? $backendEnv : (file_exists($rootEnv) ? $rootEnv : null);

        if ($envFile && is_readable($envFile)) {
            // Check if vlucas/phpdotenv is available in vendor
            if (class_exists('Dotenv\Dotenv')) {
                try {
                    $dotenv = \Dotenv\Dotenv::createImmutable(dirname($envFile), basename($envFile));
                    $dotenv->safeLoad();
                    self::$loaded = true;
                    return;
                } catch (\Throwable $e) {
                    // Fall back to native parser if Dotenv throws an exception
                }
            }

            // Native strict parser (Zero eval(), strict key=value parsing)
            self::parseEnvFile($envFile);
        }

        self::$loaded = true;
    }

    /**
     * Strict native parser for .env files supporting comments, quotes, and newlines
     */
    private static function parseEnvFile(string $filePath): void
    {
        $lines = @file($filePath, FILE_IGNORE_NEW_LINES);
        if ($lines === false) {
            return;
        }

        $currentKey = null;
        $currentVal = '';
        $inMultiLine = false;

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($inMultiLine) {
                // Check if this line closes the multiline quote
                if (substr($trimmed, -1) === '"' || substr($trimmed, -1) === "'") {
                    $currentVal .= "\n" . substr($trimmed, 0, -1);
                    self::setEnvVar($currentKey, $currentVal);
                    $inMultiLine = false;
                    $currentKey = null;
                    $currentVal = '';
                } else {
                    $currentVal .= "\n" . $line;
                }
                continue;
            }

            // Ignore empty lines and comment lines
            if ($trimmed === '' || strpos($trimmed, '#') === 0) {
                continue;
            }

            if (strpos($trimmed, '=') !== false) {
                list($key, $value) = explode('=', $trimmed, 2);
                $key = trim($key);
                $value = trim($value);

                // Check for multiline quote start
                if (
                    (strpos($value, '"') === 0 && (strlen($value) === 1 || substr($value, -1) !== '"')) ||
                    (strpos($value, "'") === 0 && (strlen($value) === 1 || substr($value, -1) !== "'"))
                ) {
                    $inMultiLine = true;
                    $currentKey = $key;
                    $currentVal = substr($value, 1);
                    continue;
                }

                // Strip surrounding single or double quotes
                if (
                    (strpos($value, '"') === 0 && substr($value, -1) === '"') ||
                    (strpos($value, "'") === 0 && substr($value, -1) === "'")
                ) {
                    $value = substr($value, 1, -1);
                }

                self::setEnvVar($key, $value);
            }
        }
    }

    /**
     * Sets an environment variable in $_ENV and putenv()
     */
    private static function setEnvVar(string $key, string $value): void
    {
        if ($key === '') {
            return;
        }

        // Replace escaped newlines
        $value = str_replace('\\n', "\n", $value);

        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }

    /**
     * Retrieves an environment variable with optional default and type normalization
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        self::load();

        $val = $_ENV[$key] ?? getenv($key);

        if ($val === false || $val === null || $val === '') {
            return $default;
        }

        // Normalize boolean and null string literals
        $lower = strtolower((string)$val);
        if ($lower === 'true' || $lower === '(true)') {
            return true;
        }
        if ($lower === 'false' || $lower === '(false)') {
            return false;
        }
        if ($lower === 'null' || $lower === '(null)') {
            return null;
        }
        if ($lower === 'empty' || $lower === '(empty)') {
            return '';
        }

        return $val;
    }

    /**
     * Retrieves an integer environment variable
     */
    public static function getInt(string $key, int $default = 0): int
    {
        $val = self::get($key, $default);
        return is_numeric($val) ? (int)$val : $default;
    }

    /**
     * Retrieves a boolean environment variable
     */
    public static function getBool(string $key, bool $default = false): bool
    {
        $val = self::get($key, $default);
        return filter_var($val, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Checks if application is running in production mode
     */
    public static function isProduction(): bool
    {
        return strtolower((string)self::get('APP_ENV', 'development')) === 'production';
    }

    /**
     * Checks if debug mode is enabled
     */
    public static function isDebug(): bool
    {
        return self::getBool('APP_DEBUG', false);
    }
}
