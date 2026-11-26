<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

return [
    'assetManager' => [
        'appendTimestamp' => true,
        'bundles' => [
            'yii\widgets\ActiveFormAsset' => [
                'depends' => ['visitor\assets\CoreAsset'],
            ],
            'yii\web\YiiAsset' => [
                'depends' => ['visitor\assets\CoreAsset'],
            ],
            'yii\web\JqueryAsset' => [
                'css' => [],
                'js' => [],
            ],
            'yii\bootstrap\BootstrapPluginAsset' => [
                'css' => [],
                'js' => [],
            ],
            'yii\bootstrap\BootstrapAsset' => [
                'css' => [],
            ],
        ],
    ],
    'urlManager' => [
        'class' => 'yii\web\UrlManager',
        'showScriptName' => false,
        'enablePrettyUrl' => true,
        'rules' => require(__DIR__ . '/rules.php'),
    ],
    'request' => [
        'cookieValidationKey' => 'gxyqSuTKsuweSmMsdnqQ',
        'baseUrl' => '',
    ],
    'mailer' => [
        'class' => 'yii\swiftmailer\Mailer',
        'useFileTransport' => false,
    ],
    'statsDB' => require(__DIR__ . '/statsDb.php')
];