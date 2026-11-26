<?
/* @var $this yii\web\View
 * @var $data visitor\widgets\blocks\MoneyMarketBlockWidget
 * @var $lastDate visitor\widgets\blocks\MoneyMarketBlockWidget
 */

use yii\helpers\Url;
use common\helpers\DateHelper;
use visitor\helpers\HtmlHelper;

?>
<div class="table_table">
    <div style="text-align: center;"><? echo Yii::t('app', 'From {date}', ['date' => DateHelper::showDate($lastDate, 'dd.MM.YYYY')]) ?></div>
    <div class="valuta_title"><? echo Yii::t('app', 'Money-Market-Nots') ?></div>
    <div class="table_items">
        <div class="table_row">
            <a class="valyuta" href="<? echo Url::to(['info-blocks/index', 'alias' => 'nots_volume']) ?>">
                <? echo HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_volume') ?>
            </a>
            <div class="kurs"><? echo $data['notsVolume']->value ?></div>
        </div>


        <?php


        $connection = Yii::$app->db;

        $deyer=1;

        $command = $connection->createCommand('
    SELECT * FROM settings_saf
');


        $res=$command->queryAll();






        $check=false;
        $gosterme=false;
        $deyer='';
        foreach ($res as $key => $value) {
            if($value['key']=='show_7gunluk'){


                $check=true;
                $deyer=$value;



            }
        }






        ?>



        <?php if($check==true && $deyer['value']==1):?>
        <div class="table_row"><a class="valyuta" href="<? echo Url::to(['info-blocks/index', 'alias' => 'nots_levels_7']) ?>"><? echo HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_levels_7') ?></a>
            <div class="kurs"><? echo $data['notsLevels7']->value ?></div>
        </div>
        <?php endif; ?>
        <div class="table_row"><a class="valyuta" href="<? echo Url::to(['info-blocks/index', 'alias' => 'nots_levels_28']) ?>"><? echo HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_levels_28') ?></a>
            <div class="kurs"><? echo $data['notsLevels28']->value ?></div>
        </div>
        <div class="table_row"><a class="valyuta" href="<? echo Url::to(['info-blocks/index', 'alias' => 'nots_levels_84']) ?>"><? echo HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_levels_84') ?></a>
            <div class="kurs"><? echo $data['notsLevels84']->value ?></div>
        </div>
        <div class="table_row"><a class="valyuta" href="<? echo Url::to(['info-blocks/index', 'alias' => 'nots_levels_168']) ?>"><? echo HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_levels_168') ?></a>
            <div class="kurs"><? echo $data['notsLevels168']->value ?></div>
        </div>
        <div class="table_row"><a class="valyuta" href="<? echo Url::to(['info-blocks/index', 'alias' => 'nots_levels_252']) ?>"><? echo HtmlHelper::getValueFromArray(Yii::t('other', 'infolines'), 'nots_levels_252') ?></a>
            <div class="kurs"><? echo $data['notsLevels252']->value ?></div>
        </div>
    </div>
</div>
<div class="money-market-chart">
    <canvas id="moneyMarket" width="260" height="260"></canvas>
</div>
