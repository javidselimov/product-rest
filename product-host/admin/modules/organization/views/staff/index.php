<?

/* @var $model admin\modules\organization\viewmodels\OrganizationViewModel
 * */

use yii\helpers\Html;
use yii\helpers\Url;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

$this->title = Yii::t('app', 'Organizations-Staff-' . $model->staffType);
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['staff/manage', 'type' => $model->staffType], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'position', 'headerOptions' => ['width' => '100']],
        ['attribute' => 'name_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['name_az'], Url::to(['staff/manage', 'type' => $row['type'], 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'job_az'],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '250'], 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['staff/change-status', 'type' => $row['type'], 'id' => $row['id']]));
        }],
    ],
]);
?>

