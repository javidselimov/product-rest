<?

/* @var $dataProvider common\models\MeasInfoType
 * */

use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;

$this->title = Yii::t('app', 'MEAS Info Types');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['manage'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), ['index'], ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'name_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row->name_az, Url::to(['manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'name_en'],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
    ],
]);
?>

