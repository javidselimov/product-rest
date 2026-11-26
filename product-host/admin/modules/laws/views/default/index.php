<?

/* @var $model admin\modules\laws\viewmodels\LawsViewModel
 * */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use admin\assets\FancyboxAsset;
use common\components\grid\GridView;

FancyboxAsset::register($this);

$this->title = $model->category['title_az'];
$this->params['breadcrumbs'][] = Yii::t('app', 'Laws');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'filterModel' => $model->lawsModel,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['default/manage', 'category' => $model->category['id'], 'type' => $model->type], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']) .
            Html::a('<i class="icon ion-arrow-return-left"></i> ' . Yii::t('app', 'Back-Button'), Url::to(['categories/index']), ['class' => 'btn btn-primary waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']),
    ],
    'columns' => [
        ['attribute' => 'title_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_az'], Url::to(['default/manage', 'id' => $row['id'], 'category' => $row['category_id'], 'type' => $row['type']]), ['data - pjax' => '0']);
        }],
        ['attribute' => 'type', 'format' => 'html', 'value' => function ($row) {
            return ArrayHelper::getValue(Yii::t('model', 'Laws-Types'), $row['type']) . " ($row->type)";
        }],
        ['attribute' => 'active', 'format' => 'html', 'value' => function ($row) {
            return ArrayHelper::getValue(Yii::t('model', 'Laws-Status'), $row['active']) . " ($row->active)";
        }],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        [
            'header' => Yii::t('app', 'Actions'),
            'class' => 'yii\grid\ActionColumn',
            'template' => '{copy_url}',
            'buttons' => [
                'copy_url' => function ($url, $row) {
                    return Html::tag('span', 'Copy URL', [
                        'class' => 'btn btn-teal btn-copy js-copy',
                        'data-toggle' => 'tooltip',
                        'data-placement' => 'bottom',
                        'data-copy' => Yii::$app->urlManagerFrontend->createUrl(['laws/detail', 'id' => $row['id'], 'slug' => $row['slug']]),
                        'title' => false,
                    ]);
                },
            ],
        ],
    ],
]);
?>