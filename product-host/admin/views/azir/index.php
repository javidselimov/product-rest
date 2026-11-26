<?

/* @var $model admin\viewmodels\UsersViewModel */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;
use admin\helpers\HtmlHelper;



$this->title = Yii::t('app', 'Azir Indeksləri');
$this->params['breadcrumbs'][] = $this->title;


$connection = Yii::$app->db;

$deyer=1;

$command = $connection->createCommand('
    SELECT * FROM settings_saf
');


$res=$command->queryAll();


$check=false;
$gosterme=false;
foreach ($res as $key => $value) {
    if($value['key']=='show_before_day'){
        $check=true;
        $gosterme=$value['value'];


    }
}

if($check==false){
    $connection = Yii::$app->db;
    $command = $connection->createCommand("INSERT INTO settings_saf (key, value)
VALUES ('show_before_day', false)
");
    $result = $command->execute();
    $gosterme=false;
}

if($gosterme==true) {
    $text = Yii::t('app', 'Əvvəlki günün indeksinə görə hesablanmışdır(Text göstərilir)');
}else{
    $text=Yii::t('app', 'Əvvəlki günün indeksinə görə hesablanmışdır(Text göstərilmir)');
}




echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' => '<div class="btn-container" style="display: flex; flex-wrap: wrap; gap: 10px;">'.
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['azir/create'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Ana Səhifədəki Görünənləri təmizlə'), ['azir/clean'], ['class' => 'btn btn-warning waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . $text, ['azir/before'], ['class' => 'btn btn-primary waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']).
            Html::a('<i class="icon ion-upload"></i> ' . Yii::t('app', 'Pdf Azir uploader'), ['azir/upload'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5'])
        .'</div>',
    ],
    'columns' => [
        ['attribute' => 'title_az', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_az'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],

        ['attribute' => 'title_en', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['title_en'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'faiz_az', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['faiz_az'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'faiz_en', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['faiz_en'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],

        ['attribute' => 'eqd_hecm_az', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['eqd_hecm_az'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],

        ['attribute' => 'eqd_hecm_en', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['eqd_hecm_en'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'eqd_hecm_usd', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['eqd_hecm_usd'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'eqd_say_az', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['eqd_say_az'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'eqd_say_en', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['eqd_say_en'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'date', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['date'], Url::to(['azir/create', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'Ana sehifede goster', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return  $row['home_view'] == 1 ? 'Beli' : 'Xeyr';
        }],
        ['attribute' => 'Sira', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return  $row['order_column'] ;
        }],
        ['attribute' => 'Ana sehifedeki tarixi burdan gotur', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return  $row['date_view'] == 1 ? 'Beli' : 'Xeyr';
        }],
//        ['attribute' => 'active', 'headerOptions' => ['width' => '120'], 'format' => 'html', 'value' => function ($row) {
//            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['users/change-status', 'id' => $row['id']]));
//        }],
    ],
]);
?>
