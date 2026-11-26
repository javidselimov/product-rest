<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

return [
    '<controller:\w+>' => '<controller>/index',
    '<controller:\w+>/<action:\w+>/<id:\d+>' => '<controller>/<action>',
    '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
    ['class' => 'yii\rest\UrlRule', 'controller' => 'api'],
];