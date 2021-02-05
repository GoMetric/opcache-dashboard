<?php

/**
 * Tool for managing OPcache.
 * 
 * Works in pull mode when data pulls by server from observable nodes, so this this 
 * script must be placed somewhere on observable node for accessing through web.
 * 
 * @see https://github.com/sokil/OpcacheDashboard
 * 
 * MIT License
 */
declare(strict_types=1);

/**
 * Router
 */
$command = (string) filter_input(INPUT_GET, 'command');
switch ($command) {
    case '':
    case 'status':
        $pretty = (bool) filter_input(INPUT_GET, 'pretty');
        statusCommand($pretty);
        break;

    case 'reset':
        opcache_reset();
        break;

    case 'invalidate':
        $scriptPath = (string) filter_input(INPUT_GET, 'script');
        invalidateCommand($scriptPath);
        break;
    
    default:
        http_response_code(404);
        break;
}

/**
 * Invalidate command invalidates passed script in OPcache
 */
function invalidateCommand(string $scriptPath): void
{
    if (empty($scriptPath)) {
        http_response_code(400);
        return;
    }

    if (!file_exists($scriptPath)) {
        http_response_code(404);
        return;
    }

    opcache_invalidate($scriptPath, true);
}

/**
 * Status command return status of OPcache
 */
function statusCommand(bool $pretty): void
{
    $jsonEncodeFlags = 0;

    if ($pretty) {
        $jsonEncodeFlags |= JSON_PRETTY_PRINT;
    }
    
    header('Content-type: application/json');
    
    echo json_encode(
        [
            'configuration' => opcache_get_configuration(),
            'status' => opcache_get_status(),
        ],
        $jsonEncodeFlags
    );
}
