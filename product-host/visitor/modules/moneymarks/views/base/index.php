<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\moneymarks\viewmodels\MoneyMarksViewModel
 */

use yii\helpers\Url;
use yii\helpers\HtmlPurifier;

$this->title = $model->category['title_' . Yii::$app->language] . ' - ' . $model::getMarksType($model->type);
?>
<div class="content_wrap money_marks">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('../layouts/menu') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><? echo $model->category['title_' . Yii::$app->language] ?></div>
                <div class="type_text">
                    <? echo HtmlPurifier::process($model->category['description_' . Yii::$app->language]); ?>
                </div>
                <div class="gallery-grid">
                    <? foreach ($model->tableData as $marks): ?>
                        <div class="gallery-item" data-href="<? echo Url::to([$model::getDetailUrl($marks['type']), 'id' => $marks['id']]) ?>">
                            <? $img = Yii::$app->params['uploadsUrl'] . '/money-marks/' . $marks['front_image'] ?>
                            <? if ($model->type == $model::BANKNOTES_TYPE): ?>
                                <div class="image" style="background-image: url(<? echo $img ?>)"></div>
                            <? else: ?>
                                <div class="image coins">
                                    <img src="<? echo $img ?>">
                                </div>
                            <? endif; ?>
                            <div class="caption marks">
                                <p><? echo $marks['title_' . Yii::$app->language] ?></p>
                            </div>
                        </div>
                    <? endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>


