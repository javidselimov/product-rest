<?

/* @var $model admin\viewmodels\YieldCurveViewModel */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;
use admin\helpers\HtmlHelper;



$this->title = Yii::t('app', 'Yield Curve');
$this->params['breadcrumbs'][] = $this->title;



$connection = Yii::$app->db;


$command = $connection->createCommand('
    SELECT * FROM yield_curves
');


$res=$command->queryAll();









echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['yield-curve/create'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'file name', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['file_name'], Url::to(['yield-curve/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'parametr_file'],
        ['attribute' => 'yield_file_name'],
        ['attribute' => 'date'],


//        ['attribute' => 'active', 'headerOptions' => ['width' => '120'], 'format' => 'html', 'value' => function ($row) {
//            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['users/change-status', 'id' => $row['id']]));
//        }],
    ],
]);
?>
