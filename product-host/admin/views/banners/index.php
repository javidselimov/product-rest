<?

/* @var $dataProvider admin\controllers\BannersController
 * */

use yii\helpers\Html;
use yii\helpers\Url;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

$this->title = Yii::t('app', 'Banners');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['banners/manage'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), ['banners/index'], ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'position', 'headerOptions' => ['width' => '100']],
        ['attribute' => 'title_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_az'], Url::to(['banners/manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '250'], 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['banners/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>

