<?php

/**
 * Tool for managing OPcache.
 * 
 * Works in pull mode when data pulls by server from observable nodes, so this this 
 * script must be placed somewhere on observable node for accessing through web.
 * 
 * @see https://github.com/GoMetric/opcache-dashboard
 * 
 * MIT License
 */
declare(strict_types=1);

/**
 * Check opcache extension configured
 */
if (!function_exists('opcache_get_status')) {
    sendResponse(
        500, 
        ['error' => 'Opcache extension not loaded']
    );
    return;
}

/**
 * Router
 */
$command = (string) filter_input(INPUT_GET, 'command');
switch ($command) {
    case '':
    case 'status':
        $pretty = (bool) filter_input(INPUT_GET, 'pretty');
        $scripts = (bool) filter_input(INPUT_GET, 'scripts');
        statusCommand($pretty, $scripts);
        break;

    case 'reset':
        resetCommand();
        break;

    case 'invalidate':
        $scriptPath = (string) filter_input(INPUT_GET, 'script');
        invalidateCommand($scriptPath);
        break;
    
    default:
        sendResponse(400, ['error' => 'Invalid command specified']);
        break;
}

/**
 * Complete reset of opcache
 */
function resetCommand(): void
{
    opcache_reset();

    sendResponse(200, ['error' => null]);
}

/**
 * Invalidate command invalidates passed script in OPcache
 */
function invalidateCommand(string $scriptPath): void
{
    if (empty($scriptPath)) {
        sendResponse(400, ['error' => 'Script not defined']);
        return;
    }

    if (!file_exists($scriptPath)) {
        sendResponse(404, ['error' => 'Script not found']);
        return;
    }

    opcache_invalidate($scriptPath, true);

    sendResponse(200, ['error' => null]);
}

/**
 * Status command return status of OPcache
 */
function statusCommand(bool $pretty, bool $scripts): void
{   
    sendResponse(
        200,
        [
            'configuration' => opcache_get_configuration(),
            'status' => opcache_get_status($scripts),
        ],
        $pretty
    );
}

function sendResponse(int $code, array $body, bool $pretty = false): void
{
    http_response_code($code);
    header('Content-type: application/json');
    
    $jsonEncodeFlags = 0;

    if ($pretty) {
        $jsonEncodeFlags |= JSON_PRETTY_PRINT;
    }

    echo json_encode(
        $body,
        $jsonEncodeFlags
    );
}
