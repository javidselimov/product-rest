<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

return [
    /* Кастомные правила */
    'infoblocks/<alias:[a-zA-Z0-9-_]+>' => 'info-blocks/index',
    'organization/management-<type:\d+>' => 'organization/staff',
    'currencies/<date:[0-9.]+>.xml' => 'currency/xml',
    'page-<id:[0-9]+>/<slug:[a-zA-Z-_0-9]+>' => 'pages/index',
    'search/<type:[a-zA-Z-_]+>/<query:[\s\S]*>' => 'search/index',
    'search/<type:[a-zA-Z-_]+>' => 'search/index',
    'search' => 'search/index',
    'press-release-<id:[0-9]+>/<slug:[a-zA-Z-_0-9]+>' => 'press-releases/detail',
    'press-releases/<type:[0-9]+>' => 'press-releases/index',
    'rss/releases/<language:[a-z]+>' => 'rss/releases',
    'rss/releases/<count:[0-9]+>' => 'rss/releases',
    'rss/releases/<language:[a-z]+>/<count:[0-9]+>' => 'rss/releases',
    'law-<id:[0-9]+>/<slug:[a-zA-Z-_0-9]+>' => 'laws/detail',
    'stats/first/<id:[0-9]+>-<limit:[0-9]+>' => 'stats/first',
    'stats/second/<id:[0-9]+>-<limit:[0-9]+>' => 'stats/second',
    'stats/third/<id:[0-9]+>-<limit:[0-9]+>' => 'stats/third',
    'stats-monthly/first/<id:[0-9]+>' => 'stats-monthly/first',
    'stats-monthly/second/<id:[0-9]+>-<limit:[0-9]+>' => 'stats-monthly/second',
    'stats-monthly/third/<id:[0-9]+>-<limit:[0-9]+>' => 'stats-monthly/third',
    'stats-yearly/first/<id:[0-9]+>' => 'stats-yearly/first',
    'stats-yearly/second/<id:[0-9]+>-<limit:[0-9]+>' => 'stats-yearly/second',
    'stats-yearly/third/<id:[0-9]+>-<limit:[0-9]+>' => 'stats-yearly/third',
    /* Общие правила */
    '<controller:\w+>' => '<controller>/index',
    '<controller:\w+>/<action:\w+>/<id:\d+>' => '<controller>/<action>',
    '<controller:\w+>/<action:\w+>/<alias:\w+>' => '<controller>/<action>',
    '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
    /* Для модулей */
    'moneymarks/news-<id:[0-9]+>/<slug:[a-zA-Z-_]+>' => 'moneymarks/news/detail',
    '<module:\w+>/<controller:\w+>/<action:[a-zA-Z0-9-_.]+>/<id:\d+>' => '<module>/<controller>/<action>',
];