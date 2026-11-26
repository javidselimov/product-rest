<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

$config = [
    'id' => 'cbar-visitor',
    'layout' => false,
    'language' => 'az',
    'defaultRoute' => 'home',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'visitor\controllers',
    'bootstrap' => ['log'],
    'modules' => require(__DIR__ . '/modules.php'),
    'components' => require(__DIR__ . '/components.php'),
    'params' => require(__DIR__ . '/params.php'),
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
    ];
}

return $config;