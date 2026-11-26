<?

/* @var $this \yii\web\View
 * @var $formModel visitor\models\MeasForm
 * @var $model visitor\viewmodels\MeasViewModel
 * @var $measData common\models\Meas
 * @var $dataProvider common\models\Meas
 */

use yii\widgets\ListView;
use yii\widgets\Pjax;
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <? Pjax::begin(['enablePushState' => false]); ?>
            <? $this->title = Yii::t('app', 'MEAS Page'); ?>
            <div class=" clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="meas-search-wrap">
                    <? echo $this->render('_form', ['model' => $model, 'formModel' => $formModel]) ?>
                </div>
                <?
                echo ListView::widget([
                    'dataProvider' => $dataProvider,
                    'itemView' => '_table',
                    'layout' => "{summary}\n{items}\n<div class='pagination-table'>{pager}</div>",
                ]);
                ?>
            </div>
            <? Pjax::end(); ?>
        </div>
    </div>
</div>
