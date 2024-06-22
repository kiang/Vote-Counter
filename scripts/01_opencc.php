<?php
$basePath = dirname(__DIR__);

exec("find {$basePath} -type f", $lines);
foreach ($lines as $line) {
    $p = pathinfo($line);
    if (isset($p['extension'])) {
        switch ($p['extension']) {
            case 'md':
            case 'txt':
            case 'html':
            case 'php':
            case 'css':
            case 'js':
            case 'json':
            case 'xml':
            case 'yml':
            case 'yaml':
                exec("opencc -c s2tw -i {$line} -o {$line}");
                break;
        }
    }
}
