<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\gallery\viewmodels\GalleryViewModel
 */

use yii\helpers\Url;
use yii\helpers\Html;
use yii\helpers\HtmlPurifier;
use common\helpers\DateHelper;

$this->title = Yii::t('app', 'Photo-Gallery');
?>
<div class="content_wrap gallery">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title">
                    <a href="<? echo Url::to(['/gallery/photos']) ?>"><? echo $this->title ?></a>
                </div>
                <div class="type_text">
                    <h3><? echo $model->selectedGallery['title_' . Yii::$app->language] ?> - <? echo DateHelper::showDate($model->selectedGallery['date'], 'dd.MM.YYYY') ?></h3>
                    <hr>
                    <? echo HtmlPurifier::process($model->selectedGallery['content_' . Yii::$app->language]); ?>
                </div>
                <div class="thumbnails">
                    <div class="justified-gallery lightgallery">
                        <? foreach ($model->selectedGallery->galleryImages as $image): ?>
                            <a href="<? echo Yii::$app->params['uploadsUrl'] . '/photo-gallery/' . $image['filename'] ?>">
                                <? echo Html::img(Yii::$app->params['uploadsUrl'] . '/photo-gallery/' . $image['filename']) ?>
                            </a>
                        <? endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


