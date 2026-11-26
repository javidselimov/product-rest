<?php

/* @var $this View
 * @var $registryViewModel visitor\viewmodels\RegistryViewModel
 * @var $data array
 */

use yii\helpers\Url;
use yii\web\View;

?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><?php echo $this->render('//layouts/menu/left') ?></aside>
            <?php $this->title = Yii::t('app', 'Currencies'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;"><strong>Valyuta mübadiləsi fəaliyyəti</strong> - Azərbaycan Respublikasında xarici valyutanın qanunla müəyyən edilmiş qaydada alınması, satılması və dəyişdirilməsidir.</p>
                        <p style="text-align:justify;"><br>Valyuta mübadiləsi fəaliyyətinə lisenziya almış şəxslər - “Valyuta tənzimi haqqında” Azərbaycan Respublikasının Qanunu ilə müəyyən edilmiş qaydada valyuta mübadiləsi fəaliyyətinə lisenziya almış rezident hüquqi və fiziki şəxslər və qeyri-rezident hüquqi şəxslərin filiallarıdır.</p>
                        <p style="text-align:justify;"><br>Azərbaycan Respublikasının Mərkəzi Bankı valyuta mübadiləsi fəaliyyətinə verilmiş lisenziyaların ictimaiyyət üçün açıq olan mərkəzi reyestrini tərtib edir.</p>
                    <?php else: ?>
                        <p style="text-align:justify;"><strong>Currency exchange – </strong>buying, selling and exchange of a foreign currency in the Republic of Azerbaijan in the order specified in the legislation.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Persons licensed to engage in currency exchange are resident legal entities, individuals, and branches of non-resident legal entities licensed to engage in currency exchange in the order specified in the Law of the Republic of Azerbaijan on Currency Regulation.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">The Central Bank of the Republic of Azerbaijan maintains a public register of currency exchange licenses.</p>
                    <?php endif; ?>
                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::current(['download' => 1]) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <p><?php echo $this->title ?></p>
                                <span><?php echo Yii::t('app', 'More-Button') ?></span>
                            </div>
                        </a>
                    </div>
                    <div class="registry-data">
                        <dl>
                            <?php
                            foreach ($data as $item) {
                                $registryViewModel->renderRegistryItem($item);
                            }
                            ?>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>