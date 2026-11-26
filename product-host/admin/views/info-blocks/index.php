<?

/* @var $model admin\viewmodels\InfoBlocksViewModel
 * */

use yii\helpers\Html;
use yii\helpers\Url;
use admin\helpers\HtmlHelper;
use common\components\grid\GridView;

$this->title = $model->title;
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
    if($value['key']=='show_7gunluk'){
        $check=true;
        $gosterme=$value['value'];
    }
}

if($check==false){
    $connection = Yii::$app->db;
    $command = $connection->createCommand("INSERT INTO settings_saf (key, value)
VALUES ('show_7gunluk', false)
");
    $result = $command->execute();
    $gosterme=false;
}



if($gosterme==true) {
    $text = '7 günlük göstərici açıqdır ';
}else{
    $text='7 günlük göstərici bağlıdır';
}



echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['info-blocks/manage', 'alias' => $model->alias], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('' . Yii::t('app', $text), ['info-blocks/active', 'alias' => $model->alias], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'date', 'format' => 'html', 'value' => function ($row) {
            return Html::a(Yii::$app->formatter->asDate($row['date'], 'long'), Url::to(['info-blocks/manage', 'id' => $row['id'], 'alias' => $row['alias']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'value', 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::clearSpaces($row['value']);
        }],
        ['attribute' => 'created_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['created_at'], 'long');
        }],
        ['attribute' => 'updated_at', 'format' => 'html', 'value' => function ($row) {
            return Yii::$app->formatter->asDate($row['updated_at'], 'long');
        }],
    ],
]);
?>

