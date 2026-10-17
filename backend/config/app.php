<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * BACKEND APPLICATION CONFIGURATION & ENV ADAPTER (backend/config/app.php)
 * ==============================================================================
 */

if (!defined('ARKITECT_BACKEND_LOADED')) {
    define('ARKITECT_BACKEND_LOADED', true);
}

require_once __DIR__ . '/bootstrap.php';

use Arkitect\Config\Env;

/**
 * Loads key-value pairs from a .env file (Legacy compatibility facade)
 */
function arkitect_load_env($path) {
    Env::load();
}

/**
 * Retrieves an environment variable with optional default fallback (Legacy compatibility facade)
 */
function arkitect_env($key, $default = null) {
    return Env::get($key, $default);
}
