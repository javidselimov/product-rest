<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\gallery\viewmodels\GalleryViewModel
 */

use yii\helpers\Url;
use common\helpers\DateHelper;

$this->title = Yii::t('app', 'Photo-Gallery');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <div class="gallery-grid gallery-pagination">
                    <? foreach ($model->tableData as $gallery): ?>
                        <div class="gallery-item" data-href="<? echo Url::to(['/gallery/photos/detail', 'id' => $gallery['id']]) ?>">
                            <? $img = Yii::$app->params['uploadsUrl'] . '/photo-gallery/' . $gallery->coverImage['filename'] ?>
                            <div class="image" style="background-image: url(<? echo $img ?>)"></div>
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


