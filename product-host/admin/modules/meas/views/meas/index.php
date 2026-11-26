<?

/* @var $dataProvider common\models\Meas
 * */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

$this->title = Yii::t('app', 'MEAS');
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
        ['attribute' => 'emitent_id', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row->emitent['name_az'], Url::to(['manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'info_type_id', 'value' => 'infoType.name_az'],
        ['attribute' => 'doc_type_id', 'value' => function ($row) {
            return ArrayHelper::getValue(Yii::t('model', 'MEAS-Document-Types'), $row['doc_type_id']);
        }],
        ['attribute' => 'reg_date'],
        ['attribute' => 'reg_date'],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '250'], 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['meas/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>

