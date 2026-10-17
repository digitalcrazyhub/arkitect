<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * CORE BACKEND BOOTSTRAP (backend/config/bootstrap.php)
 * ==============================================================================
 */

if (!defined('ARKITECT_BACKEND_LOADED')) {
    define('ARKITECT_BACKEND_LOADED', true);
}

// 1. SPL Class Autoloader for Arkitect Namespaces
spl_autoload_register(function ($class) {
    $prefix = 'Arkitect\\';
    $baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR;

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $parts = explode('\\', $relativeClass);

    // Map top-level namespace segments to folder names
    if (count($parts) >= 2) {
        $folder = strtolower($parts[0]);
        $subpath = implode(DIRECTORY_SEPARATOR, array_slice($parts, 1));
        $file = $baseDir . $folder . DIRECTORY_SEPARATOR . $subpath . '.php';

        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// 2. Load Composer Vendor Autoloader if available
$vendorAutoloadBackend = dirname(__DIR__) . '/vendor/autoload.php';
$vendorAutoloadRoot    = dirname(dirname(__DIR__)) . '/vendor/autoload.php';

if (file_exists($vendorAutoloadBackend)) {
    require_once $vendorAutoloadBackend;
} elseif (file_exists($vendorAutoloadRoot)) {
    require_once $vendorAutoloadRoot;
}

// 3. Load Environment Configuration
\Arkitect\Config\Env::load();

// 4. Configure Application Timezone
$timezone = \Arkitect\Config\Env::get('APP_TIMEZONE', 'Asia/Kolkata');
date_default_timezone_set($timezone);

// 5. Configure Error Reporting & Logging
if (\Arkitect\Config\Env::isDebug()) {
    ini_set('display_errors', '0'); // Never leak raw errors to client HTTP stream
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
}

ini_set('log_errors', '1');
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
ini_set('error_log', $logDir . '/php_errors.log');

/**
 * Global operational logger for safe backend events
 *
 * @param string $category
 * @param string $message
 * @param array $context
 * @return void
 */
function arkitect_app_log(string $category, string $message, array $context = []): void
{
    $dir = dirname(__DIR__) . '/logs';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $logFile = $dir . '/app.log';
    $time = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_SLASHES) : '';
    $line = "[{$time}] [{$category}] {$message}{$contextStr}" . PHP_EOL;
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}
