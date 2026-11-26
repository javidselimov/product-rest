<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\InfoBlocksViewModel
 */

use yii\helpers\Url;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

$this->title = $model->title;
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><a href="<? echo Url::to(['info-blocks/index', 'alias' => $model->alias]) ?>"><? echo strip_tags($this->title) ?></a></div>
                <div class="table_wrap">
                    <div class="table_body">
                        <div class="table_title">

                            <?php
                            $deyer='';

                            switch ($model->year%10) {
                                case 1: $deyer.='-ci il'; break;
                                case 2: $deyer.='-ci il'; break;
                                case 3: $deyer.='-cü il'; break;
                                case 4: $deyer.='-cü il'; break;
                                case 5: $deyer.='-ci il'; break;
                                case 6: $deyer.='-cı il'; break;
                                case 7: $deyer.='-ci il'; break;
                                case 8: $deyer.='-ci il'; break;
                                case 9: $deyer.='-cu il'; break;
                                case 0: $deyer.='-cu il'; break;
                            }
                            ?>


                            <?php if(Yii::$app->language=='az'): ?>
                            <p><? echo $model->year ?><?=$deyer?></p>
                            <?php else: ?>
                            <p><? echo $model->year ?></p>
                            <?php endif; ?>
                            <div class="date_select">
                                <input type="text" class="date-infolines white_date" data-pmu-locale="<? echo Yii::$app->language ?>" data-pmu-date="<? echo $model->year ?>" data-pmu-format="Y">
                            </div>
                        </div>
                    </div>
                    <div class="table_content">
                        <div class="table_table">
                            <? if ($model->tableData): ?>
                                <div class="valuta_title">
                                    <div class="val_title"><? echo Yii::t('model', 'Date') ?></div>
                                    <div class="kod_title"><? echo Yii::t('model', 'Value') ?></div>
                                </div>
                                <div class="table_items table-pagination">
                                    <? foreach ($model->tableData as $infoline): ?>
                                        <div class="table_row">
                                            <div class="valuta"><? echo DateHelper::showDate($infoline['date']) ?></div>
                                            <div class="kod"><? echo HtmlHelper::clearSpaces($infoline['value']); ?></div>
                                        </div>
                                    <? endforeach; ?>
                                </div>
                            <? else: ?>
                                <p>Heç bir nəticə tapılmadı</p>
                            <? endif; ?>
                        </div>
                        <? if ($model->alias === 'bank_nation'): ?>
                            <div class="infoblocks-text">
                                <? echo Yii::t('app', 'InfoBlocks-Table-Text') ?>
                            </div>
                        <? elseif ($model->alias === 'money_reserve_usd'): ?>
<!--                            <div class="infoblocks-text">-->
<!--                                --><?// echo Yii::t('app', 'InfoBlocks-Money-Reserve-Text') ?>
<!--                            </div>-->
                        <? endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
