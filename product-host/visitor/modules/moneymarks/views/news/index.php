<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\moneymarks\viewmodels\MoneyMarksViewModel
 */

use yii\helpers\Url;
use common\helpers\DateHelper;

$this->title = Yii::t('app', 'Moneymarks') . ' - ' . Yii::t('app', 'News');
?>
<div class="content_wrap press-releases">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('../layouts/menu') ?></aside>
            <div class=" clear inner white_content">
                <div class="content_title"><a href="<? echo Url::canonical() ?>"><? echo $this->title ?></a></div>
                <? if ($model->tableData): ?>
                    <div class="articles press-releases-pagination">
                        <? foreach ($model->tableData as $news): ?>
                            <div class="article_item">
                                <span><? echo DateHelper::showDate($news['date'], 'long') ?></span>
                                <p><? echo $news['title_' . Yii::$app->language] ?></p>
                                <a href="<? echo Url::to(['news/detail', 'id' => $news['id']]) ?>" class="article_btn"><? echo Yii::t('app', 'More') ?></a>
                            </div>
                        <? endforeach; ?>
                    </div>
                <? else: ?>
                    <div class="articles">
                        <div class="article_item">
                            <p><? echo Yii::t('app', 'Empty-Data') ?></p>
                        </div>
                    </div>
                <? endif; ?>
            </div>
        </div>
    </div>
</div>