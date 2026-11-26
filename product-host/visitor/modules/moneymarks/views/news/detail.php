<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\moneymarks\viewmodels\MoneyMarksViewModel
 */

use yii\helpers\Url;
use yii\helpers\HtmlPurifier;

$this->title = $model->detailData['title_' . Yii::$app->language];
?>
<div class="content_wrap press-releases">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('../layouts/menu') ?></aside>
            <div class=" clear inner">
                <div class="content_title">
                    <a href="<? echo Url::to(['news/index']) ?>"><? echo Yii::t('app', 'News') ?></a>
                </div>
                <div class="type_text pages-gallery">
                    <div class="type_title"><? echo $model->detailData['title_' . Yii::$app->language] ?></div>
                    <hr>
                    <? echo HtmlPurifier::process($model->detailData['content_' . Yii::$app->language]); ?>
                </div>
            </div>
        </div>
    </div>
</div>