<?php

use yii\helpers\Url;
?>
<li><a href="javascript:" class="menu_link menu_drop_link"><? echo Yii::t('app', 'MEAS') ?><span></span></a>
    <ul class="submenu">
        <li><a href="<? echo Url::to(['meas/index']) ?>"><? echo Yii::t('app', 'MEAS Page') ?></a></li>
        <li><a href="/page-182/about-esid"><? echo Yii::t('app', 'MEAS About') ?></a></li>
    </ul>
</li>