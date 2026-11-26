<?

/* @var $this \yii\web\View
 * @var $formModel visitor\viewmodels\CurrencyRatesViewModel
 * @var $model visitor\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\Url;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

$this->title = Yii::t('app', 'AZN-Currencies');
$xmlDate = DateHelper::showDate($model->lastCurrency['date'], 'dd.MM.YYYY');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <div class=" clear inner">
                <div class="content_title"><a href="<? echo Url::to(['currency/rates']) ?>"><? echo $this->title ?></a></div>
                <? echo $this->render('//layouts/social') ?>
                <div class="type_text">
                    <p><? echo Yii::t('app', 'AZN-Currency-Note-Main') ?></p><br>
                    <p><? echo Yii::t('app', 'AZN-Currency-Note-Main2') ?></p><br>
                    <p><? echo Yii::t('app', 'AZN-Currency-Note-Main3') ?></p><br>
                    <p><? echo Yii::t('app', 'AZN-Currency-Note-Main4') ?></p><br>
                    <p><? echo Yii::t('app', 'AZN-Currency-Additional-EN') ?></p><br>

                    <p><? echo Yii::t('app', 'AZN-Currency-Note-Additional') ?></p>
                    <a target="_blank" href="<? echo Url::to(['currency/xml', 'date' => $xmlDate]) ?>">https://cbar.az/currencies/<? echo $xmlDate ?>.xml</a>


                </div>
                <div class="table_wrap">
                    <? echo $this->render('_form', ['formModel' => $formModel]) ?>
                    <div class="table_body">
                        <div class="table_title">
                            <div>
                                <p><? echo Yii::t('app', 'AZN-Currency-Last') ?></p>
                                <a href="<? echo Url::current(['export' => 'true']) ?>" class="excel-btn hint--right hint--bounce" aria-label="<? echo Yii::t('app', 'Export-to-Excel') ?>"></a>
                            </div>
                            <div class="date_select">
                                <input type="text" class="date-current white_date" data-pmu-locale="<? echo Yii::$app->language ?>" data-pmu-date="<? echo DateHelper::showDate($model->lastCurrency['date']) ?>" data-pmu-format="d/m/Y">
                            </div>
                        </div>
                    </div>
                    <div class="table_content">
                        <div class="table_table">
                            <div class="valuta_title">
                                <div class="val_title"><? echo Yii::t('model', 'Currency') ?></div>
                                <div class="kod_title"><? echo Yii::t('model', 'Code') ?></div>
                                <div class="kurs_title"><? echo Yii::t('model', 'Rate') ?></div>
                                <div class="dynam_title"></div>
                            </div>
                            <div class="table_items">
                                <? foreach (Yii::t('other', 'currencies') as $code => $title): ?>
                                    <!-- Выводим сортированные массивы -->
                                    <? if ($model->lastCurrency[$code]): ?>



                                        <div class="table_row">


                                            <?php




                                            //belarus rublu 01.07.2016-cı il tarixine qeder 100 Belarus rublu kimi gosterilir
                                            if($code=='byn' and ( DateTime::createFromFormat('d.m.Y', trim($xmlDate)) < DateTime::createFromFormat('d.m.Y', trim('01.07.2016')) )){

                                                ?>


                                                <div class="valuta"><? echo Yii::t('other', 'byn100') ?></div>


                                            <?php
                                            }
                                            elseif($code=='tmt' and ( DateTime::createFromFormat('d.m.Y', trim($xmlDate)) <= DateTime::createFromFormat('d.m.Y', trim('12.01.2009')) ) and ( DateTime::createFromFormat('d.m.Y', trim($xmlDate)) >= DateTime::createFromFormat('d.m.Y', trim('02.10.2005')) )){
                                               ?>
                                                <div class="valuta"><? echo Yii::t('other', 'tmt100') ?></div>

                                                    <?php
                                            }elseif(in_array($code,['irr','uzs','lbp','jpy']) and ( DateTime::createFromFormat('d.m.Y', trim($xmlDate)) < DateTime::createFromFormat('d.m.Y', trim('02.10.2005')) )){
                                                ?>
                                                <div class="valuta"><? echo Yii::t('other', '1'.$code) ?></div>

                                                    <?php
                                            }elseif(in_array($code,['kzt','rub','irr']) and ( DateTime::createFromFormat('d.m.Y', trim($xmlDate)) < DateTime::createFromFormat('d.m.Y', trim('18.11.2024')) )){
                                                ?>
                                                <div class="valuta"><? echo Yii::t('other', '2'.$code) ?></div>

                                                    <?php
                                            }else{
                                                ?>
                                                <div class="valuta"><? echo Yii::t('other', $title) ?></div>


                                            <?php
                                            }

                                            ?>

                                            <div class="kod"><? echo $code == 'sdr' ? 'xdr' : $code ?></div>
                                            <div class="kurs"><? echo HtmlHelper::currencyFormat($model->lastCurrency[$code]) ?></div>
                                            <div class="dynamic"><? HtmlHelper::showCurrencyRateIcon($model->lastCurrency[$code], $model->previousCurrency[$code]) ?></div>
                                        </div>
                                    <? endif; ?>
                                    <!-- -->
                                <? endforeach; ?>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
