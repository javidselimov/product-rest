<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

return [
    'cache' => [
        'class' => 'yii\caching\FileCache',
    ],
    'user' => [
        'identityClass' => 'common\components\identity\UserIdentity',
        'enableAutoLogin' => true,
        'authTimeout' => 28800, // 8 часов бездействия
        'loginUrl' => ['login/index'],
    ],
    'errorHandler' => [
        'errorAction' => 'error/error',
    ],
    'mailer' => [
        'class' => 'yii\swiftmailer\Mailer',
        'useFileTransport' => true,
    ],
    'log' => [
        'traceLevel' => YII_DEBUG ? 3 : 0,
        'targets' => [
            [
                'class' => 'yii\log\FileTarget',
                'levels' => ['error', 'warning'],
            ],
            [
                'class' => 'yii\log\FileTarget',
                'levels' => ['info'],
                'categories' => ['qradar'],
                'logFile' => '/var/log/cbar_app',
                'logVars' => [],
            ],
            [
                'class' => 'yii\log\FileTarget',
                'levels' => ['info'],
                'categories' => ['qradar-test'],
                'logFile' => 'C:\laragon\www\cbar.az\www\admin\runtime\logs\test.log',
                'logVars' => [],
            ],
        ],
    ],
    'db' => require(__DIR__ . '/db.php'),
    'i18n' => require(__DIR__ . '/i18n.php'),
    'formatter' => [
        'class' => 'common\components\Formatter',
        'decimalSeparator' => '.',
        'sizeFormatBase' => '1000',
    ],
    'view' => [
        'class' => '\ogheo\htmlcompress\View',
        'compress' => YII_ENV_DEV ? false : true,
    ],
    'mailObfuscator' => [
        'class' => 'common\components\mail\Obfuscator',
    ],
    'siteSearch' => [
        'class' => 'himiklab\yii2\search\Search',
        'indexDirectory' => '@visitor/runtime/site-search',
        'models' => [
            'common\models\Pages',
        ],
    ],
    'newsSearch' => [
        'class' => 'himiklab\yii2\search\Search',
        'indexDirectory' => '@visitor/runtime/news-search',
        'models' => [
            'common\models\PressReleases',
        ],
    ],
];