<?

/* @var $model admin\viewmodels\UsersViewModel */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use common\components\grid\GridView;
use admin\helpers\HtmlHelper;

$this->title = Yii::t('app', 'Users');
$this->params['breadcrumbs'][] = $this->title;

echo GridView::widget([
    'dataProvider' => $model->tableData,
    'panel' => [
        'heading' => '<h3 class="panel-title">' . $this->title . '</h3>',
        'type' => 'panel panel-color panel-inverse panel-table',
        'before' =>
            Html::a('<i class="icon ion-plus"></i> ' . Yii::t('app', 'Add-Row'), ['users/manage'], ['class' => 'btn btn-success waves-effect w-md waves-light m-t-5', 'data-pjax' => '0']) . ' ' .
            Html::a('<i class="icon ion-refresh"></i> ' . Yii::t('app', 'Reset-Table'), Url::canonical(), ['class' => 'btn btn-inverse waves-effect w-md waves-light m-t-5']),
    ],
    'columns' => [
        ['attribute' => 'username', 'headerOptions' => ['width' => '200'], 'format' => 'html', 'value' => function ($row) {
            return Html::a($row['username'], Url::to(['users/manage', 'id' => $row['id']]), ['data-pjax' => '0']);
        }],
        ['attribute' => 'email', 'headerOptions' => ['width' => '400'],],
        ['attribute' => 'role', 'headerOptions' => ['width' => '400'], 'format' => 'html', 'value' => function ($row) {
            return ArrayHelper::getValue(Yii::t('other', 'roles'), $row['role']);
        }],
        ['attribute' => 'active', 'headerOptions' => ['width' => '120'], 'format' => 'html', 'value' => function ($row) {
            return HtmlHelper::getRecordStatusButton($row['active'], Url::to(['users/change-status', 'id' => $row['id']]));
        }],
    ],
]);
?>

