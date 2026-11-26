<?

/* @var $dataProvider yii\data\ActiveDataProvider */

use yii\helpers\Html;
use yii\helpers\Url;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

$this->title = Yii::t('app', 'News-Slider');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $dataProvider,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['news-slider/manage'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), ['news-slider/index'], ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'ordering', 'headerOptions' => ['width' => '100']],
        ['attribute' => 'title_az', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_az'], Url::to(['news-slider/manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'title_en', 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_en'], Url::to(['news-slider/manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'news_date', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['news_date'], 'long');
        }],
        ['attribute' => 'is_active', 'headerOptions' => ['width' => '250'], 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['is_active'], Url::to(['news-slider/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>
