<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\PagesViewModel
 */

use yii\helpers\Html;
use yii\helpers\HtmlPurifier;
use common\helpers\FileHelper;
use visitor\assets\GoogleMapsAsset;

if ($model->page['slug'] == 'contacts') GoogleMapsAsset::register($this);
/* Facebook meta tags */
$this->title = $model->page['title_' . Yii::$app->language];
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'article']);
$this->registerMetaTag(['property' => 'og:title', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:description', 'content' => strip_tags($model->page['content_' . Yii::$app->language])]);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>

<style>
    dd iframe{
        width: 100%!important;
        height:480px!important;
    }
</style>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <? if ($model->pageID != 898): ?>
                <aside>
                    <? echo $model->showPagesMenu(); ?>
                    <!-- Anniversary Menu -->
                    <? echo $model->anniversaryHelper->showMenu() ?>
                    <? echo $this->render('//layouts/menu/left'); ?>
                </aside>
            <? endif; ?>
            <div class="content_content clear <? if ($model->pageID != 877) echo " inner ";?> " <? if ($model->pageID == 898) echo 'style="width: 100%"'; ?>>
                <!-- Anniversary banner -->
                <? echo $model->anniversaryHelper->showBanner() ?>
                <div class="content_title">
                    <? echo $this->title ?>
                    <div id="controls">
                        <a href="javascript:" id="small" class="letter minus">A<span class="resize-icon">-</span></a>
                        <a href="javascript:" id="medium" class="letter plus">A<span class="resize-icon">+</span></a>
                    </div>
                </div>
                <? if ($model->coverImage): ?>
                    <div class="big_img">
                        <? echo Html::img(Yii::$app->params['uploadsUrl'] . '/assets/' . $model->coverImage) ?>
                    </div>
                <? endif; ?>
                <? if ($model->pageID != 877) echo $this->render('//layouts/social') ?>
                <? if ($model->pageID == 877): ?>
                    <div class="type_text-alx">
                        <?= $this->render('//structure/_orgchart') ?>
                    </div>
                <? endif; ?>
                <div id="urlEncode" class="type_text pages-gallery <? echo $model->anniversaryHelper->getCSSClass() ?>" data-moreButton="<? echo Yii::t('app', 'More-Button') ?>">
                    <?
                    echo HtmlPurifier::process($model->page['content_' . Yii::$app->language], [
                        'Attr.EnableID' => true,
                        'HTML.SafeIframe' => 'true',
                        'URI.SafeIframeRegexp' => '%^(https?:)?//(www\.youtube(?:-nocookie)?\.com/embed/|player\.vimeo\.com/video/|www\.google\.com/maps/embed)%',                    ]);
                    ?>
                    <div class="download_block assets-pagination">
                        <? foreach ($model->pagesAssets as $asset): ?>
                            <!-- Проверяем на наличие файлов и совместимого языка -->
                            <? if (FileHelper::checkAssetType($asset)): ?>
                                <!-- Выводим ресурсы страницы -->
                                <? if (!$asset['cover'] and $asset['visible']): ?>
                                    <a id="asset-<? echo $asset['position'] ?>" target="_blank" href="<? echo Yii::$app->params['uploadsUrl'] . '/assets/' . FileHelper::checkAssetLanguage($asset) ?>" class="download_item" download="true">
                                        <? echo FileHelper::showAssetImageIcon(FileHelper::checkAssetLanguage($asset), ['width' => '60px']) ?>
                                        <div>
                                            <p><? echo $asset['title_' . Yii::$app->language] ?></p>
                                            <span><? echo FileHelper::getRemoteFileSize(FileHelper::checkAssetLanguage($asset)) ?></span>
                                        </div>
                                    </a>
                                <? endif; ?>
                                <!-- Конец -->
                            <? endif; ?>
                            <!-- Конец -->
                        <? endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
