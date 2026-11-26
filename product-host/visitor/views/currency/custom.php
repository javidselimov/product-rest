<?

/* @var $this \yii\web\View
 * @var $formModel visitor\viewmodels\CurrencyRatesViewModel
 * @var $model visitor\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

$this->title = Yii::t('app', 'AZN-Currencies');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class="content_content clear inner">
                <div class="content_title"><a href="<? echo Url::to(['currency/rates']) ?>"><? echo $this->title ?></a></div>
                <? echo $this->render('//layouts/social') ?>
                <div class="table_wrap">
                    <? echo $this->render('_form', ['formModel' => $formModel]) ?>
                    <div class="table_body">
                        <div class="table_title">
                            <div>
                                <p><? echo ArrayHelper::getValue(Yii::t('other', 'currencies'), $formModel['currencyCode']) ?></p>
                                <a href="<? echo Url::current(['export' => 'true']) ?>" class="excel-btn hint--right hint--bounce" aria-label="<? echo Yii::t('app', 'Export-to-Excel') ?>"></a>
                            </div>
                        </div>
                    </div>
                    <? if ($model): ?>
                        <div class="table_content">
                            <div class="table_table">
                                <div class="valuta_title">
                                    <div class="val_title"><? echo Yii::t('model', 'Date') ?></div>
                                    <div class="kod_title"><? echo Yii::t('model', 'Rate') ?></div>
                                </div>
                                <div class="table_items table-pagination">
                                    <? foreach ($model as $currency): ?>
                                        <div class="table_row">
                                            <div class="valuta"><? echo DateHelper::showDate($currency['date']) ?></div>
                                            <div class="kod">
                                                <? echo (floatval($currency[$formModel['currencyCode']]) == 0.0) ? '-' : HtmlHelper::currencyFormat($currency[$formModel['currencyCode']]); ?>
                                            </div>
                                        </div>
                                    <? endforeach; ?>
                                </div>
                            </div>
                        </div>
                    <? else: ?>
                        <div class="table_content">
                            <div class="table_table">
                                <p><? echo Yii::t('app', 'Empty-Data') ?></p>
                            </div>
                        </div>
                    <? endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>