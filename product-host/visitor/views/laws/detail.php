<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\LawsViewModel
 */

use yii\helpers\HtmlPurifier;

/* Facebook meta tags */
$this->title = $model->law['title_' . Yii::$app->language];
$this->registerMetaTag(['property' => 'og:url', 'content' => Yii::$app->request->absoluteUrl]);
$this->registerMetaTag(['property' => 'og:type', 'content' => 'law']);
$this->registerMetaTag(['property' => 'og:title', 'content' => $this->title]);
$this->registerMetaTag(['property' => 'og:description', 'content' => strip_tags($model->law['description_' . Yii::$app->language])]);
$this->registerMetaTag(['property' => 'og:image', 'content' => 'https://www.cbar.az/images/social-logo.png']);
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside>
                <? echo $this->render('//layouts/menu/left'); ?>
            </aside>
            <div class="content_content clear inner">
                <div class="content_title">
                    <? echo $this->title ?>
                    <div id="controls">
                        <a href="javascript:" id="small" class="letter minus">A<span class="resize-icon">-</span></a>
                        <a href="javascript:" id="medium" class="letter plus">A<span class="resize-icon">+</span></a>
                    </div>
                </div>
                <? echo $this->render('//layouts/social') ?>
                <div class="type_text pages-gallery" data-moreButton="<? echo Yii::t('app', 'More-Button') ?>">
                    <?
                    echo HtmlPurifier::process($model->law['description_' . Yii::$app->language], [
                        'Attr.EnableID' => true,
                        'HTML.SafeIframe' => 'true',
                        'URI.SafeIframeRegexp' => '%^(https?:)?//(www\.youtube(?:-nocookie)?\.com/embed/|player\.vimeo\.com/video/)%',
                    ]);
                    ?>
                </div>
            </div>
        </div>
    </div>
</div>