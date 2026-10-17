<?php
/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * RATE LIMITER UTILITY (backend/utils/RateLimiter.php)
 * ==============================================================================
 */

namespace Arkitect\Utils;

if (!defined('ARKITECT_BACKEND_LOADED')) {
    exit('Direct access not permitted.');
}

class RateLimiter
{
    /**
     * Path to rate limiting storage file
     */
    private static function getStoragePath(): string
    {
        $dir = dirname(__DIR__) . '/logs';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        return $dir . '/rate_limit.json';
    }

    /**
     * Checks whether the client IP has exceeded the allowed request quota.
     * Uses atomic file locking to prevent concurrency race conditions.
     *
     * @param string $ip
     * @param int $maxRequests
     * @param int $windowSeconds
     * @return array [ 'allowed' => bool, 'retry_after' => int, 'remaining' => int ]
     */
    public static function check(string $ip, int $maxRequests = 5, int $windowSeconds = 600): array
    {
        $filePath = self::getStoragePath();
        $now = time();

        $fp = @fopen($filePath, 'c+');
        if (!$fp) {
            // Fail open if file system cannot open storage, but log error
            return ['allowed' => true, 'retry_after' => 0, 'remaining' => $maxRequests];
        }

        // Acquire exclusive lock
        flock($fp, LOCK_EX);

        $fileSize = filesize($filePath);
        $content = $fileSize > 0 ? fread($fp, $fileSize) : '';
        $data = [];

        if ($content !== '') {
            $decoded = json_decode($content, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }

        // Clean up decayed timestamps older than the decay window for all IPs
        foreach ($data as $loggedIp => $timestamps) {
            $filtered = array_values(array_filter($timestamps, function ($timestamp) use ($now, $windowSeconds) {
                return ($now - $timestamp) < $windowSeconds;
            }));

            if (empty($filtered)) {
                unset($data[$loggedIp]);
            } else {
                $data[$loggedIp] = $filtered;
            }
        }

        $ipTimestamps = $data[$ip] ?? [];
        $attemptCount = count($ipTimestamps);

        if ($attemptCount >= $maxRequests) {
            // Calculate when the oldest attempt in the current window will expire
            $oldestInWindow = min($ipTimestamps);
            $retryAfter = max(1, ($oldestInWindow + $windowSeconds) - $now);

            // Save pruned data back and release lock
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);

            return [
                'allowed'     => false,
                'retry_after' => $retryAfter,
                'remaining'   => 0
            ];
        }

        // Record this attempt
        $ipTimestamps[] = $now;
        $data[$ip] = $ipTimestamps;

        // Save data back and release lock
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        return [
            'allowed'     => true,
            'retry_after' => 0,
            'remaining'   => max(0, $maxRequests - count($ipTimestamps))
        ];
    }
}
