<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\organization\viewmodels\OrganizationViewModel
 */

use yii\helpers\Html;

$this->title = Yii::t('app', 'Organizations-Offices');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <? echo $this->render('../layouts/menu') ?>
            <div class="content_content clear inner white_content">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="info_cards">
                    <? foreach ($model->records as $office): ?>
                        <div class="card_item">
                            <div class="card_img">
                                <? echo Html::img(Yii::$app->params['uploadsUrl'] . '/organization/' . $office['photo'], ['class' => 'small']) ?>
                            </div>
                            <div class="card_text">
                                <div class="card_text_title"><? echo $office['title_' . Yii::$app->language] ?></div>
                                <div class="card_string"><span><? echo Yii::t('app', 'Adress') ?>:</span><? echo $office['adress_' . Yii::$app->language] ?></div>
                                <div class="card_string"><span><? echo Yii::t('app', 'Office-Phone') ?>:</span><? echo $office['phone'] ?></div>
                                <div class="card_string"><span><? echo Yii::t('app', 'Office-Director') ?>:</span><? echo $office['director_name_' . Yii::$app->language] ?></div>
                            </div>
                            <? echo Html::a(Yii::t('app', 'Regulation'), Yii::$app->params['uploadsUrl'] . '/organization/' . $office['filename_' . Yii::$app->language], ['class' => 'card_link ' . Yii::$app->language . '', 'target' => '_blank']) ?>
                        </div>
                    <? endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>