<?

/* @var $model admin\viewmodels\PressReleasesViewModel */

use yii\helpers\Html;
use yii\helpers\Url;
use common\helpers\FileHelper;
use common\components\grid\GridView;

echo GridView::widget([
    'dataProvider' => $model->assetsTableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . Yii::t('app', 'Pages-Assets') . '</h3>',
        'type' => 'panel panel-color panel-teal panel-table',
    ],
    'columns' => [
        ['attribute' => 'position', 'headerOptions' => ['width' => '70']],
        ['attribute' => 'filename_az', 'header' => Yii::t('model', 'Icon') . ' (AZ)', 'headerOptions' => ['width' => '60'], 'format' => 'raw', 'value' => function ($row) {
            return FileHelper::showAssetImageIcon($row['filename_az'], ['class' => 'img-thumbnail'], 'press-releases');
        }],
        ['attribute' => 'filename_en', 'header' => Yii::t('model', 'Icon') . ' (EN)', 'headerOptions' => ['width' => '60'], 'format' => 'raw', 'value' => function ($row) {
            return FileHelper::showAssetImageIcon($row['filename_en'], ['class' => 'img-thumbnail'], 'press-releases');
        }],
        ['attribute' => 'title', 'header' => Yii::t('model', 'File-Title-AZ'), 'format' => 'raw', 'value' => function ($row) use ($model) {
            return Html::a($row['title'], Url::current(['id' => $row['id'], 'pageID' => $model->assetsPageID]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'title_en', 'header' => Yii::t('model', 'File-Title-EN'), 'format' => 'raw', 'value' => function ($row) use ($model) {
            return Html::a($row['title_en'] ?: '-', Url::current(['id' => $row['id'], 'pageID' => $model->assetsPageID]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'created_at', 'format' => 'datetime',],
        ['attribute' => 'updated_at', 'format' => 'datetime',],
        [
            'header' => Yii::t('app', 'Actions'),
            'class' => 'yii\grid\ActionColumn',
            'template' => '{copy} {delete}',
            'buttons' => [
                'copy' => function ($url, $row) {
                    $html = '';
                    if (!empty($row['filename_az'])) {
                        $html .= Html::tag('span', 'AZ', [
                            'class' => 'btn btn-teal btn-xs btn-copy js-copy',
                            'data-toggle' => 'tooltip',
                            'data-placement' => 'bottom',
                            'data-copy' => Yii::$app->params['uploadsUrl'] . '/press-releases/' . $row['filename_az'],
                            'title' => 'Copy AZ URL',
                        ]);
                    }
                    if (!empty($row['filename_en'])) {
                        if ($html) $html .= ' ';
                        $html .= Html::tag('span', 'EN', [
                            'class' => 'btn btn-teal btn-xs btn-copy js-copy',
                            'data-toggle' => 'tooltip',
                            'data-placement' => 'bottom',
                            'data-copy' => Yii::$app->params['uploadsUrl'] . '/press-releases/' . $row['filename_en'],
                            'title' => 'Copy EN URL',
                        ]);
                    }
                    return $html;
                },
                'delete' => function ($url, $row) use ($model) {
                    return Html::a(
                        Yii::t('app', 'Delete'),
                        ['press-releases/delete-asset', 'id' => $row['id'], 'pageID' => $model->assetsPageID],
                        ['class' => 'btn btn-danger btn-xs', 'data-pjax' => '0', 'data-confirm' => 'Are you sure?']
                    );
                },
            ],
        ],
    ],
]);
?>