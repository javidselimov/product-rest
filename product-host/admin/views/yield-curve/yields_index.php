<?

/* @var $model admin\viewmodels\YieldCurveViewModel */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;
use admin\helpers\HtmlHelper;



$this->title = Yii::t('app', 'Yield Curve Yields');
$this->params['breadcrumbs'][] = $this->title;













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
        ['attribute' => 'date'],
        ['attribute' => 'period'],
        ['attribute' => 'profitability'],
        ['attribute' => 'delete all', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return '<a class="deleteall btn btn-danger" href="/yield-curve/yields-delete?date='.$row['date'].'">'.$row['date'].'</a>';

        }],
    ],
]);
?>


<script>
       document.addEventListener('click', function (event) {
           if (event.target.classList.contains('deleteall')) {
               if (!confirm('All data related to this date will be deleted. Do you approve?')) {
                   event.preventDefault();
               }
           }
       });
</script>
