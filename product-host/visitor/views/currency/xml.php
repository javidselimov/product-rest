<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\CurrencyRatesViewModel
 */

use common\helpers\DateHelper;

$ignoreCurrencies = ['xpd', 'xpt', 'xag', 'xau'];
$currentDate = DateHelper::showDate($model->lastCurrency['date'], 'dd.MM.YYYY');
?>
<ValCurs Date="<? echo $currentDate ?>" Name="AZN məzənnələri" Description="Azərbaycan Respublikası Mərkəzi Bankının <? echo $currentDate ?> tarixdən etibarən xarici valyutaların və bank metallarının Azərbaycan manatına qarşı rəsmi məzənnələri bülleteni">

    <ValType Type="Bank metalları">
        <Valute Code="XPD">
            <Nominal>1 t.u.</Nominal>
            <Name>Palladium</Name>
            <Value><? echo $model->lastCurrency['xpd'] ?></Value>
        </Valute>
        <Valute Code="XPT">
            <Nominal>1 t.u.</Nominal>
            <Name>Platin</Name>
            <Value><? echo $model->lastCurrency['xpt'] ?></Value>
        </Valute>
        <Valute Code="XAG">
            <Nominal>1 t.u.</Nominal>
            <Name>Gümüş</Name>
            <Value><? echo $model->lastCurrency['xag'] ?></Value>
        </Valute>
        <Valute Code="XAU">
            <Nominal>1 t.u.</Nominal>
            <Name>Qızıl</Name>
            <Value><? echo $model->lastCurrency['xau'] ?></Value>
        </Valute>
    </ValType>

    <ValType Type="Xarici valyutalar">
        <? foreach (Yii::t('other', 'currencies') as $code => $title): ?>

            <? if ($model->lastCurrency[$code] and !in_array($code, $ignoreCurrencies)): ?>
                <Valute Code="<? echo strtoupper($code) ?>">





                    <?php


                    //belarus rublu 01.07.2016-cı il tarixine qeder 100 Belarus rublu kimi gosterilir
                    if($code=='byn' and ( DateTime::createFromFormat('d.m.Y', trim($currentDate)) < DateTime::createFromFormat('d.m.Y', trim('01.07.2016')) )){

                        ?>

                        <Nominal><? echo preg_replace('/[^0-9]/', '', Yii::t('other', 'byn100')) ?></Nominal>

                        <Name><? echo Yii::t('other', 'byn100') ?></Name>



                        <?php
                    }
                    elseif($code=='tmt' and ( DateTime::createFromFormat('d.m.Y', trim($currentDate)) <= DateTime::createFromFormat('d.m.Y', trim('12.01.2009')) ) and ( DateTime::createFromFormat('d.m.Y', trim($currentDate)) >= DateTime::createFromFormat('d.m.Y', trim('02.10.2005')) )){
                        ?>
                        <Nominal><? echo preg_replace('/[^0-9]/', '', Yii::t('other', 'tmt100')) ?></Nominal>

                        <Name><? echo Yii::t('other', 'tmt100') ?></Name>


                        <?php

                    }elseif(in_array($code,['irr','uzs','lbp','jpy']) and ( DateTime::createFromFormat('d.m.Y', trim($currentDate)) < DateTime::createFromFormat('d.m.Y', trim('02.10.2005')) )){
                        ?>

                        <Nominal><? echo preg_replace('/[^0-9]/', '', Yii::t('other', '1'.$code)) ?></Nominal>


                        <Name><? echo Yii::t('other', '1'.$code) ?></Name>



                            <?php
                    }elseif(in_array($code,['kzt','rub','irr']) and ( DateTime::createFromFormat('d.m.Y', trim($currentDate)) < DateTime::createFromFormat('d.m.Y', trim('18.11.2024')) )){
                        ?>

                        <Nominal><? echo preg_replace('/[^0-9]/', '', Yii::t('other', '2'.$code)) ?></Nominal>


                        <Name><? echo Yii::t('other', '2'.$code) ?></Name>



                            <?php
                    }
                    else{
                        ?>

                        <Nominal><? echo preg_replace('/[^0-9]/', '', Yii::t('other', $title)) ?></Nominal>

                        <Name><? echo Yii::t('other', $title) ?></Name>



                        <?php
                    }

                    ?>

                    <Value><? echo $model->lastCurrency[$code] ?></Value>
                </Valute>
            <? endif; ?>

        <? endforeach; ?>
    </ValType>
</ValCurs>
