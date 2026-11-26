<?

/* @var $model admin\modules\moneymarks\viewmodels\MoneyMarksViewModel
 * */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use admin\assets\FancyboxAsset;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

FancyboxAsset::register($this);

$this->title = ArrayHelper::getValue(Yii::t('model', 'Money-Marks-Types'), $model->type);
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['default/manage', 'category' => $model->category, 'type' => $model->type], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']) .
            Html::a('<i class="icon ion-arrow-return-left"></i> ' . Yii::t('app', 'Back-Button'), Url::to(['categories/index']), ['class' => 'btn btn-primary waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']),
    ],
    'columns' => [
        ['attribute' => 'position', 'headerOptions' => ['width' => '100']],
        ['attribute' => 'title_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_az'], Url::to(['default/manage', 'id' => $row['id'], 'category' => $row['category_id'], 'type' => $row['type']]), ['data - pjax' => '0']);
        }],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '250'], 'format' => 'raw', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['default/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>