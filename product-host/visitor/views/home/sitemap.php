<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\VideosViewModel
 */

use visitor\widgets\SitemapWidget;

$this->title = Yii::t('app', 'Sitemap');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="sitemap-wrapper">
                    <? echo SitemapWidget::widget(); ?>
                </div>
            </div>
        </div>
    </div>
</div>


