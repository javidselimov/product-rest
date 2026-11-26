<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\moneymarks\viewmodels\MoneyMarksViewModel
 */

use visitor\helpers\HtmlHelper;
use yii\helpers\Html;
use yii\helpers\HtmlPurifier;

$this->title = $model->detailData->category['title_' . Yii::$app->language] . ' - ' . $model::getMarksType($model->detailData['type']);
$frontImage = Yii::$app->params['uploadsUrl'] . '/money-marks/' . $model->detailData['front_image'];
$rearImage = Yii::$app->params['uploadsUrl'] . '/money-marks/' . $model->detailData['rear_image'];
?>
<div class="content_wrap money-marks">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('../layouts/menu') ?></aside>
            <div class=" clear inner white_content">
                <div class="content_title manat_title"><? echo $model->detailData['title_' . Yii::$app->language] ?></div>
                <? if ($model->type == $model::BANKNOTES_TYPE): ?>
                    <div class="money_sides">
                        <div class="side_name"><? echo Yii::t('model', 'Front-Image') ?></div>
                        <div class="side_img lightgallery"><? echo Html::img($frontImage, ['data-src' => $frontImage]) ?></div>
                        <div class="side_img lightgallery"><? echo Html::img($rearImage, ['data-src' => $rearImage]) ?></div>
                        <div class="side_name"><? echo Yii::t('model', 'Rear-Image') ?></div>
                    </div>
                <? else: ?>
                    <div class="money_sides coin">
                        <div class="side_name"><? echo Yii::t('model', 'Front-Image') ?></div>
                        <div class="side_img_coin lightgallery"><? echo Html::img($frontImage, ['data-src' => $frontImage]) ?></div>
                        <div class="side_img_coin lightgallery"><? echo Html::img($rearImage, ['data-src' => $rearImage]) ?></div>
                        <div class="side_name"><? echo Yii::t('model', 'Rear-Image') ?></div>
                    </div>
                <? endif; ?>
                <div class="money_tabs">
                    <div class="wrap_tabs">
                        <ul class="tabs_caption">
                            <li class="active"><? echo Yii::t('app', 'Main-Features') ?></li>
                            <? if ($model->detailData['secure_az']): ?>
                                <li><? echo Yii::t('app', 'Secure-Elements') ?></li>
                            <? endif; ?>
                            <? if ($model->detailData['video_url']): ?>
                                <li><? echo Yii::t('app', 'Video') ?></li>
                            <? endif; ?>
                        </ul>
                        <div class="wr_tabs">
                            <div class="tabs_content active">
                                <div class="money_tabs_content">
                                    <? echo HtmlPurifier::process($model->detailData['description_' . Yii::$app->language]); ?>
                                </div>
                            </div>
                            <? if ($model->detailData['secure_az']): ?>
                                <div class="tabs_content">
                                    <div class="money_tabs_content">
                                        <? echo HtmlPurifier::process($model->detailData['secure_' . Yii::$app->language]); ?>
                                    </div>
                                </div>
                            <? endif; ?>
                            <? if ($model->detailData['video_url']): ?>
                                <div class="tabs_content">
                                    <div class="money_tabs_content videogallery">
                                        <div class="gallery-item" data-src="<? echo $model->detailData['video_url'] ?>">
                                            <div class="image" style="background-image: url(<? echo HtmlHelper::getYouTubeThumbnail($model->detailData['video_url']) ?>)">
                                                <img class="play-button" src="/images/play-button.png">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            <? endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
