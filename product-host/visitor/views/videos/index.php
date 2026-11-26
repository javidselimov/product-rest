<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\VideosViewModel
 */

use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

$this->title = Yii::t('app', 'Video-Gallery');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="gallery-grid videogallery gallery-pagination">
                    <? foreach ($model->tableData as $gallery): ?>
                        <div class="gallery-item" data-src="<? echo $gallery['url'] ?>" data-sub-html="<? echo $gallery['title_' . Yii::$app->language] ?>">
                            <div class="image" style="background-image: url(<? echo HtmlHelper::getYouTubeThumbnail($gallery['url']) ?>)">
                                <img class="play-button" src="/images/play-button.png">
                            </div>
                            <div class="caption">
                                <span><? echo DateHelper::showDate($gallery['date'], 'dd.MM.YYYY') ?></span>
                                <div class="line"></div>
                                <p><? echo $gallery['title_' . Yii::$app->language] ?></p>
                            </div>
                        </div>
                    <? endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>


