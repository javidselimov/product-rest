<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\PressReleasesViewModel
 */

use yii\helpers\Url;
use yii\helpers\ArrayHelper;
use yii\helpers\HtmlPurifier;
use common\helpers\FileHelper;
use common\helpers\DateHelper;
use yii\widgets\ActiveForm;
use yii\helpers\Html;

$this->title = $model->pressRelease['title_' . Yii::$app->language];
/* Facebook meta tags */
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'article']);
$this->registerMetaTag(['property' => 'og:title', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:description', 'content' => strip_tags($model->pressRelease['content_' . Yii::$app->language])]);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>
<div class="content_wrap press-releases">
    <div class="container">
        <div class="content clear">
            <aside>
                <? echo $this->render('//layouts/menu/left') ?>
            </aside>
            <div class=" clear inner">
                <div class="content_title">
                    <a href="<? echo Url::to(['press-releases/index', 'type' => $model->pressRelease['type']]) ?>">
                        <? echo ArrayHelper::getValue(Yii::t('model', 'Press-Releases-Types'), $model->pressRelease['type']); ?>
                    </a>
                    <div id="controls">
                        <a href="javascript:" id="small" class="letter minus">A<span class="resize-icon">-</span></a>
                        <a href="javascript:" id="medium" class="letter plus">A<span class="resize-icon">+</span></a>
                    </div>
                </div>
                <? echo $this->render('//layouts/social') ?>
                <div class="type_text pages-gallery">
                    <div class="type_title"><? echo $model->pressRelease['title_' . Yii::$app->language] ?></div>
                    <hr>
                    <?
                    echo HtmlPurifier::process($model->pressRelease['content_' . Yii::$app->language], [
                        'HTML.SafeIframe' => 'true',
                        'URI.SafeIframeRegexp' => '%^(https?:)?//(www\.youtube(?:-nocookie)?\.com/embed/|player\.vimeo\.com/video/)%',
                    ]);
                    ?>
                    <div class="download_block assets-pagination">
                        <? foreach ($model->pressReleaseAssets as $asset): ?>
                            <!-- Выводим ресурсы страницы -->
                            <? if ($asset['visible']): ?>
                                <a id="asset-<? echo $asset['position'] ?>" target="_blank" href="<? echo Yii::$app->params['uploadsUrl'] . '/' . $model->assetsFolder . '/' . FileHelper::checkAssetLanguage($asset) ?>" class="download_item" download="true">
                                    <? echo FileHelper::showAssetImageIcon(FileHelper::checkAssetLanguage($asset), [], $model->assetsFolder) ?>
                                    <div>
                                        <p><? echo $asset['title'] ?></p>
                                        <span><? echo FileHelper::getRemoteFileSize(FileHelper::checkAssetLanguage($asset), $model->assetsFolder) ?></span>
                                    </div>
                                </a>
                            <? endif; ?>
                            <!-- Конец -->
                        <? endforeach; ?>
                    </div>
                    <hr>
                    <? echo DateHelper::showDate($model->pressRelease['date'], 'long') ?>

                    <style>
                        .list-press{
                            display: flex;
                            gap:4px;
                            width: 250px;
                        }
                        .list-press p{
                            list-style: none!important;
                            padding: 12px;
                            border: 1px solid black;
                            border-radius: 4px;
                            flex:1;
                            display: block;
                            height: 100%;
                            text-align: center;

                        }
                    </style>


                        <? if (count($search_questions)>0): ?>

                            <? foreach ($search_questions as $tag): ?>



                    <?php



                    if (Yii::$app->session->hasFlash('message-'.$tag->id)) {
                        $message = Yii::$app->session->getFlash('message-'.$tag->id);
                        echo '<p style="color: white;
                                padding: 13px 12px;
                                background: green;
                                border-radius: 4px;
                                margin-top: 12px;">' . $message . '</p>';
                    }else if(Yii::$app->request->cookies->getValue('question-'.$tag->id)) {
                        echo '<p style="color: white;
                                padding: 13px 12px;
                                background: green;
                                border-radius: 4px;
                                margin-top: 12px;">'.Yii::t('other','Siz artıq sorğuda iştirak etmisiniz!').'</p>';
                    }else{
                        ?>

                        <? $form = ActiveForm::begin(['action' => Url::to(['/press-releases/pass']), 'enableClientScript' => false, 'method' => 'get', 'options' => ['autocomplete' => 'off', 'data-pjax' => '1']]); ?>




                        <input type="hidden" name="id" value="<?=$tag->id?>">

                        <div style="margin-top:12px;" class="press-reliz">



                            <p><?=Yii::$app->language=='az'? $tag->question : $tag->question_en;?></p>

                        </div>

                        <div style="margin-top:12px;" class="list-press">
                            <input type="hidden" value="1" name="value">
                            <p  style="background: blue;
color: white;height:100%;list-style: none!important; padding:12px;">1</p>
                            <p style="list-style: none!important; padding:12px;">2</p>
                            <p style="list-style: none!important; padding:12px;">3</p>
                            <p style="list-style: none!important; padding:12px;">4</p>
                            <p style="list-style: none!important; padding:12px;">5</p>
                        </div>
                        <p style="margin-top:12px;"><?=Yii::t('other','1-çox pis, 5-mükəmməl')?></p>
                        <p style="margin:12px 0;"><?=Yii::t('other','Qeydiniz')?>:</p>
                        <textarea name="note" id="" cols="80%" rows="10" style="outline:none; padding:12px; border:1px solid black; border-radius: 4px">

                            </textarea>

                        <button style="border-radius:4px;margin-top:12px;padding: 15px 33px; background: blue; border:none; text-align: center; color:white" type="submit"><? echo Yii::t('other', 'submit') ?></button>

                        <? ActiveForm::end(); ?>


                    <?php
                    }
                   ?>









                            <? endforeach; ?>

                        <? endif; ?>









                </div>
            </div>
        </div>
    </div>
</div>
