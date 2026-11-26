<?

/* @var $this \yii\web\View
 * @var $model visitor\modules\organization\viewmodels\OrganizationViewModel
 */

use yii\helpers\Html;

$this->title = Yii::t('app', 'Organizations-Divisions');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <? echo $this->render('../layouts/menu') ?>
            <div class="content_content clear inner">
                <div class="content_title"><? echo $this->title ?></div>
                <section class="accordion" aria-live="polite" data-behavior="accordion">
                    <? foreach ($model->records as $division): ?>
                        <article class="accordion__item js-show-item-default" data-binding="expand-accordion-item">
                        <span id="tab1" tabindex="0" class="accordion__title" aria-controls="panel1" role="tab" aria-selected="false" aria-expanded="false" data-binding="expand-accordion-trigger">
                            <h2><? echo $division['title_' . Yii::$app->language] ?></h2>
                        </span>
                            <div id="panel1" class="accordion__content" role="tabpanel" aria-hidden="true" aria-labelledby="tab1" data-binding="expand-accordion-container">
                                <div class="accordion__content-inner">
                                    <? if ($division['director_name_az'] != "Empty" or $division['director_name_en'] != "Empty"): ?>
                                        <p>
                                            <? if ($division['director_position_az'] or $division['director_position_en']): ?>
                                            <? echo $division['director_position_' . Yii::$app->language] ?>: <span class="hint--right hint--bounce" aria-label="<? echo $division['director_email'] ?>">
                                                <? else: ?>
                                                <? echo Yii::t('app', 'Director') ?>: <span class="hint--right hint--bounce" aria-label="<? echo $division['director_email'] ?>">
                                                <? endif; ?>
                                                <? echo empty($division['director_name_en']) ? $division['director_name_az'] : $division['director_name_' . Yii::$app->language] ?>
                                        </span>
                                        </p>
                                    <? endif; ?>
                                    <?
                                    if (!empty($division['filename_az']) and Yii::$app->language == 'az')
                                        echo Html::a('Əsasnamə', Yii::$app->params['uploadsUrl'] . '/organization/' . $division['filename_' . Yii::$app->language], ['class' => 'blue_btn', 'target' => '_blank'])
                                    ?>
                                </div>
                            </div>
                        </article>
                    <? endforeach; ?>
                </section>
            </div>
        </div>
    </div>
</div>