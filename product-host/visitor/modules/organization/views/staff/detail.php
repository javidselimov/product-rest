<?

/* @var $this \yii\web\View
 * @var $data visitor\modules\organization\viewmodels\OrganizationViewModel
 */

use yii\helpers\Html;
use yii\helpers\HtmlPurifier;

$this->title = $data['name_' . Yii::$app->language];
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <? echo $this->render('../layouts/menu') ?>
            <div class="content_content clear inner">
                <div class="content_title">
                    <a href="/organization/management-<? echo $data['type'] ?>">
                        <? echo Yii::t('app', 'Organizations-Staff-' . $data['type']) ?>
                    </a>
                </div>
                <div class="man_profile">
                    <div class="man_col <? if ($data['position'] == 1 and $data['type'] == 1) echo 'main' ?>">
                        <div class="man_img">
                            <? echo Html::img(Yii::$app->params['uploadsUrl'] . '/organization/' . $data['photo']) ?>
                        </div>
                    </div>
                    <div class="man_col">
                        <div class="man_txt">
                            <p><? echo $data['name_' . Yii::$app->language] ?></p>
                            <span><? echo $data['job_' . Yii::$app->language] ?></span>
                        </div>
                        <div class="man_phone">
                            <? if (!empty($data['reception_days_' . Yii::$app->language])): ?>
                                <div class="shed_man"><? echo Yii::t('app', 'Reception-Days') ?>: <? echo $data['reception_days_' . Yii::$app->language] ?></div>
                            <? endif; ?>
                            <? if (!empty($data['phone'])): ?>
                                <div class="tel_man"><? echo Yii::t('app', 'Office-Phone') ?>: <? echo $data['phone'] ?></div>
                            <? endif; ?>
                        </div>
                    </div>
                </div>
                <div class="bio_wrap">
                    <? echo HtmlPurifier::process($data['about_' . Yii::$app->language]); ?>
                </div>
            </div>

        </div>
    </div>
</div>





