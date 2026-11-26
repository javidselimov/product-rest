<?

/* @var $model admin\viewmodels\PressReleasesViewModel */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;
use admin\helpers\HtmlHelper;

//$this->title = ArrayHelper::getValue(Yii::t('model', 'Press-Releases-Types'), $model->type);
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'filterModel' => $model->pressReleasesModel,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . 'Press Reliz Statistika'. '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['press-releases/question-manage', 'type' => $model->type], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'Press Reliz', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a(\common\models\PressReleases::findOne($row['press_reliz_id'])->title_az.'-'.\common\models\PressReleases::findOne($row['press_reliz_id'])->created_at, Url::to(['press-releases/question-manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
//        ['attribute' => 'press_reliz_id'],
        ['attribute' => 'Sorğu AZ', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['question'], Url::to(['press-releases/question-manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'Sorğu EN', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['question_en'], Url::to(['press-releases/question-manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],

        ['attribute' => 'Neçə nəfər oxuyub?', 'value'=>function($row){
            return $row['visit'];
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '120'], 'format' => 'html', 'value' => function ($row) {
            return $row['active'] ? 'Aktiv' :'Passiv';
        }],
//        ['attribute' => 'active'],
        ['attribute' => 'Sorğuda iştirak edənlər', 'headerOptions' => ['width' => '120'], 'format' => 'html', 'value' => function ($row) {
//                return 'salam';
            return '<a class="btn wd-100 btn-teal" href="/press-releases/question-response?id='.$row['id'].'">Get</a>';
        }],

//        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
//            return Yii::$app->formatter->asDate($row['created_at'], 'long');
//        }],
//        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
//            return Yii::$app->formatter->asDate($row['updated_at'], 'long');
//        }],

    ],
]);
?>

