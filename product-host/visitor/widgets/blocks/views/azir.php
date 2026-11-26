<?

/* @var $this yii\web\View
 * @var $lastDate visitor\widgets\blocks\AZIRBlockWidget
 */

use common\helpers\DateHelper;
use yii\helpers\Url;


//$lastDate = DateHelper::convertToFormat($lastDate);
?>
<style>
    .azir-title-text-custom{
        font-size: 16px;
        color: #7f7f7f;
        margin-bottom: 10px;
        margin-top: 20px;
        text-align: left;
    }

</style>
<p class="azir-title-text-custom"><?= Yii::t('app', 'AZIR Chart Title') ?></p>
<br>
<canvas id="money-market-chart-new" data-version="homepage" width="260" height="260"></canvas><br>
<style>
    .custom-table {
        border-collapse: collapse;
        width: 100%;
    }
    .custom-table th, .custom-table td {
        border: 0;
        padding: 8px 12px;
        vertical-align: top;
        font-size: 12px;
    }
    .custom-table th {
        background-color: #dbe6f1;
        font-weight: bold;
    }
</style>
<table class="table custom-table">
    <thead>
    <tr>
        <th><?= Yii::t('app', 'AZIR Date') ?></th>
        <th style="width:30%"><?= date('d.m.Y', strtotime($data['lastDate'])) ?></th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td><?= Yii::t('app', 'AZIR Chart Desc1') ?><?= $data['star'] ? "*" : "" ?></td>
        <td><?= $data['1D'] ?>%</td>
    </tr>
    <tr>
        <td><?= Yii::t('app', 'AZIR Chart Desc2') ?></td>
        <td><?= $data['30D'] ?>%</td>
    </tr>
    <tr>
        <td><?= Yii::t('app', 'AZIR Chart Desc3') ?></td>
        <td><?= $data['90D'] ?>%</td>
    </tr>
    <tr>
        <td><?= Yii::t('app', 'AZIR Chart Desc4') ?></td>
        <td><?= $data['180D'] ?>%</td>
    </tr>
    <tr>
        <td><?= Yii::t('app', 'AZIR Chart Desc5') ?></td>
        <td><?= $data['TFAI'] ?></td>
    </tr>
    <tr>
        <td colspan="2"><?= $data['star'] ? Yii::t('app', 'AZIR Star') : ""?></td>
    </tr>
    </tbody>
</table>

<br>
<div class="blue_btn" style="cursor: pointer;" onclick="window.location.href='<? echo Url::to(['indeks/rates']) ?>'"><?= Yii::t('app', 'AZIR BTN1') ?></div>
<br>
<div class="blue_btn" style="cursor: pointer;" onclick="window.open('/compounded_term.pdf', '_blank')"><?= Yii::t('app', 'AZIR BTN2') ?></div>
<br>
<div class="blue_btn" style="cursor: pointer;" onclick="window.open('/methodology_for_azir_<?=Yii::$app->language?>.pdf', '_blank')"><?= Yii::t('app', 'AZIR BTN3') ?></div>
<br>

<!--
<div class="blue_btn" style="cursor: pointer;" onclick="window.location.href='<?/* echo Url::to(['indeks/rates']) */?>'"><?php /*= Yii::t('app', 'More-Button') */?></div>
<br>
<div class="blue_btn" style="cursor: pointer;" onclick="window.location.href='/indeks/all?language=<?php /*= Yii::$app->language */?>&date=<?php /*= $lastDate */?>'"><?php /*= Yii::t('app', 'All indexes') */?></div>
-->