<?

/* @var $model admin\modules\gallery\viewmodels\GalleryViewModel */

use yii\helpers\Html;
use common\helpers\FileHelper;
use common\components\grid\GridView;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . Yii::t('app', 'Photos') . '</h3>',
        'type' => 'panel panel-color panel-teal panel-table',
    ],
    'columns' => [
        ['attribute' => 'position', 'headerOptions' => ['width' => '70']],
        ['attribute' => 'filename', 'header' => Yii::t('model', 'Image'), 'headerOptions' => ['width' => '60'], 'format' => 'raw', 'value' => function ($row) {
            return FileHelper::showAssetImageIcon($row['filename'], ['class' => 'img-thumbnail'], 'photo-gallery');
        }],
        ['attribute' => 'created_at', 'format' => 'datetime',],
        ['attribute' => 'updated_at', 'format' => 'datetime',],
        [
            'header' => Yii::t('app', 'Actions'),
            'class' => 'yii\grid\ActionColumn',
            'template' => '{edit} {delete}',
            'buttons' => [
                'edit' => function ($url, $row) use ($model) {
                    return Html::a(
                        Yii::t('app', 'Edit'),
                        ['/gallery/photos/index', 'galleryID' => $row['gallery_id'], 'id' => $row['id']],
                        ['class' => 'btn btn-primary btn-xs', 'data-pjax' => '0']
                    );
                },
                'delete' => function ($url, $row) use ($model) {
                    return Html::a(
                        Yii::t('app', 'Delete'),
                        ['/gallery/photos/delete', 'galleryID' => $row['gallery_id'], 'id' => $row['id']],
                        ['class' => 'btn btn-danger btn-xs', 'data-pjax' => '0', 'data-confirm' => 'Are you sure?']
                    );
                },
            ],
        ],
    ],
]);
?>