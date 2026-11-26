<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

return [
    'assetManager' => [
        'bundles' => [
            'yii\widgets\ActiveFormAsset' => [
                'depends' => ['admin\assets\MainAsset'],
            ],
            'yii\web\YiiAsset' => [
                'depends' => ['admin\assets\MainAsset'],
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
            'kartik\dialog\DialogAsset' => [
                'css' => [],
            ],
            'kartik\dialog\DialogBootstrapAsset' => [
                'css' => [],
                'js' => [],
            ],
            'kartik\grid\GridViewAsset' => [
                'depends' => ['admin\assets\MainAsset'],
            ],
        ],
    ],
    'urlManager' => [
        'class' => 'yii\web\UrlManager',
        'showScriptName' => false,
        'enablePrettyUrl' => true,
        'rules' => require(__DIR__ . '/rules.php'),
    ],
    'urlManagerFrontend' => [
        'class' => 'yii\web\urlManager',
        'showScriptName' => false,
        'enablePrettyUrl' => true,
        'rules' => require(__DIR__ . '../../../visitor/config/rules.php'),
    ],
    'request' => [
        'cookieValidationKey' => 'KsuweSmMsdngxyqSuT',
        'baseUrl' => '',
        'parsers' => [
            'application/json' => 'yii\web\JsonParser',
        ]
    ],
    'session' => [
        'class' => 'yii\web\Session',
        'savePath' => '@admin/runtime/sessions',
        'cookieParams' => [
            'httpOnly' => true,
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        ],
    ],
    'imageResizer' => [
        'class' => 'common\components\uploader\ImageResize',
    ],
];