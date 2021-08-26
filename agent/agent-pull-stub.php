<?php

/**
 * Tool for stubbing php opcache status during development
 * 
 * @see https://github.com/GoMetric/opcache-dashboard
 * 
 * MIT License
 */
declare(strict_types=1);

$phpFileContent = '<?php $a=md5("' . str_repeat('4', 200) . '");';

for ($i = 0; $i < 200; $i++) {
    // add opcache
    $postfix = ($i % 10 === 1) ? '-' . str_repeat('42', 50) . '-' : '';

    $path = sys_get_temp_dir() . '/opcache-dashboard-' . $i . $postfix . '.php';

    if (!file_exists($path)) {
        file_put_contents($path, $phpFileContent);
    }

    require_once $path;

    // add apcu
    apcu_store((string) $i, $path);
}

require_once __DIR__ . '/agent-pull.php';