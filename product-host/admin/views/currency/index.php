<?

/* @var $dataProvider admin\controllers\CurrencyController
 * @var $searchModel admin\controllers\CurrencyController
 * */

use yii\helpers\Html;
use yii\helpers\Url;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

$this->title = Yii::t('app', 'Currency-Rates');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'filterModel' => $searchModel,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . Yii::t('app', 'Currency-Rates') . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['currency/add'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), ['currency/rates'], ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'date', 'headerOptions' => ['width' => '200'], 'format' => 'html', 'value' => function ($row) {
            return Html::a(Yii::$app->formatter->asDate($row['date'], 'long'), Url::to(['currency/edit', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'usd'],
        ['attribute' => 'eur'],
        ['attribute' => 'gbp'],
        ['attribute' => 'rub'],
        ['attribute' => 'try'],
        ['attribute' => 'active', 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['currency/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>

