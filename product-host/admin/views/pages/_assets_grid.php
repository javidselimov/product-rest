<?

/* @var $model admin\viewmodels\PagesViewModel */

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
        ['attribute' => 'filename_az', 'header' => Yii::t('model', 'Icon'), 'headerOptions' => ['width' => '60'], 'format' => 'raw', 'value' => function ($row) {
            return FileHelper::showAssetImageIcon($row['filename_az'], ['class' => 'img-thumbnail']);
        }],
        ['attribute' => 'title_az', 'format' => 'raw', 'value' => function ($row) use ($model) {
            return Html::a($row['title_az'], Url::current(['id' => $row['id'], 'pageID' => $model->pageID]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'created_at', 'format' => 'datetime',],
        ['attribute' => 'updated_at', 'format' => 'datetime',],
        [
            'header' => Yii::t('app', 'Actions'),
            'class' => 'yii\grid\ActionColumn',
            'template' => '{copy_az} {copy_en} <br> {delete}',
            'buttons' => [
                'copy_az' => function ($url, $row) {
                    return Html::tag('span', 'Copy URL (AZ)', [
                        'class' => 'btn btn-teal btn-xs btn-copy js-copy',
                        'data-toggle' => 'tooltip',
                        'data-placement' => 'bottom',
                        'data-copy' => Yii::$app->params['uploadsUrl'] . '/assets/' . $row['filename_az'],
                        'title' => false,
                    ]);
                },
                'copy_en' => function ($url, $row) {
                    if (isset($row['filename_en'])) {
                        return Html::tag('span', 'Copy URL (EN)', [
                            'class' => 'btn btn-primary btn-xs btn-copy js-copy',
                            'data-toggle' => 'tooltip',
                            'data-placement' => 'bottom',
                            'data-copy' => Yii::$app->params['uploadsUrl'] . '/assets/' . $row['filename_en'],
                            'title' => false,
                        ]);
                    }
                },
                'delete' => function ($url, $row) use ($model) {
                    return Html::a(
                        Yii::t('app', 'Delete'),
                        ['pages/delete-asset', 'id' => $row['id'], 'pageID' => $model->pageID],
                        ['class' => 'btn btn-danger btn-xs btn-delete', 'data-pjax' => '0', 'data-confirm' => 'Are you sure?']
                    );
                },
            ],
        ],
    ],
]);
?>