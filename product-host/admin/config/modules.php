<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

return [
    'gridview' => [
        'class' => '\kartik\grid\Module',
    ],
    'treemanager' => [
        'class' => '\kartik\tree\Module',
        'treeEncryptSalt' => 'KsuweSmMsdngxyqSuT_TreeSalt',
        'treeStructure' => [
            'treeAttribute' => 'parent_id',
            'leftAttribute' => 'left_position',
            'rightAttribute' => 'right_position',
            'depthAttribute' => 'depth',
        ],
        'treeViewSettings' => [
            'nodeView' => '@admin/views/pages/_form',
        ],
        'dataStructure' => [
            'nameAttribute' => 'title_az',
        ],
        'i18n' => [
            'class' => 'yii\i18n\PhpMessageSource',
            'basePath' => '@common/messages',
            'forceTranslation' => true,
        ],
    ],
    'organization' => [
        'class' => 'admin\modules\organization\Module',
    ],
    'gallery' => [
        'class' => 'admin\modules\gallery\Module',
    ],
    'moneymarks' => [
        'class' => 'admin\modules\moneymarks\Module',
    ],
    'meas' => [
        'class' => 'admin\modules\meas\Module',
    ],
    'laws' => [
        'class' => 'admin\modules\laws\Module',
    ],
    'api' => [
        'class' => 'admin\modules\api\Module',
    ],
];