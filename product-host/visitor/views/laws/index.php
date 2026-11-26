<?

/* @var $this \yii\web\View
 * @var $formModel visitor\models\LawsForm
 * @var $model visitor\viewmodels\LawsViewModel
 * @var $lawsData common\models\Laws
 * @var $dataProvider common\models\Laws
 */

use yii\grid\GridView;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\Pjax;
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <? Pjax::begin(['enablePushState' => false]); ?>
            <? $this->title = Yii::t('app', 'Laws-Page'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><? echo $this->title ?> - <? echo Yii::t('app', 'Search') ?></div>
                <div class="meas-search-wrap">
                    <? echo $this->render('_form', ['formModel' => $formModel]) ?>
                </div>
                <div class="pjax-content">
                    <?
                    echo GridView::widget([
                        'dataProvider' => $dataProvider,
                        'columns' => [
                            [
                                'class' => 'yii\grid\SerialColumn',
                                'headerOptions' => ['width' => '5%'],
                            ],
                            [
                                'attribute' => 'title_' . Yii::$app->language,
                                'label' => Yii::t('app', 'Laws-Label'),
                                'headerOptions' => ['width' => '75%'],
                                'format' => 'raw',
                                'value' => function ($data) {
                                    return Html::a($data['title_' . Yii::$app->language], Url::to(['laws/detail', 'id' => $data['id'], 'slug' => $data['slug']]), ['target' => '_blank', 'data-pjax' => '0']);
                                },
                            ],
                            [
                                'attribute' => 'type',
                                'label' => Yii::t('app', 'Laws-Type'),
                                'headerOptions' => ['width' => '48%'],
                                'value' => function ($data) {
                                    return ArrayHelper::getValue(Yii::t('model', 'Laws-Types'), $data['type']);
                                },
                            ],
                        ],
                    ]);
                    ?>
                </div>
            </div>
            <? Pjax::end(); ?>
        </div>
    </div>
</div>