<?

/* @var $model admin\modules\moneymarks\viewmodels\MoneyMarksViewModel */

use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;
use admin\helpers\HtmlHelper;

$this->title = Yii::t('app', 'Moneymarks') . ' - ' . Yii::t('app', 'News');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'filterModel' => $model->pressReleasesModel,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['news/manage', 'type' => $model->type], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'date', 'headerOptions' => ['width' => '200'], 'format' => 'html', 'value' => function ($row) {
            return Html::a(Yii::$app->formatter->asDate($row['date'], 'long'), Url::to(['news/manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'title_az'],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['updated_at'], 'long');
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '120'], 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['news/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>

