<?

/* @var $model admin\modules\moneymarks\viewmodels\MoneyMarksViewModel
 * */

use yii\helpers\Html;
use yii\helpers\Url;
use admin\assets\FancyboxAsset;
use common\components\grid\GridView;

FancyboxAsset::register($this);

$this->title = 'Kateqoriyalar';
$this->params['breadcrumbs'][] = Yii::t('app', 'Laws');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['categories/manage'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'title_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_az'], Url::to(['categories/manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['label' => 'Qanunlar', 'headerOptions' => ['width' => '270'], 'format' => 'raw', 'value' => function ($row) {
            return Html::a('Redaktə etmək', Url::to(['default/index', 'category' => $row['id']]), ['class' => 'btn wd-100 btn-primary', 'data-pjax' => '0']);
        }],
    ],
]);
?>