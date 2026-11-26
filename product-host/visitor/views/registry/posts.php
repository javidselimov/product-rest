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
            <?php $this->title = Yii::t('app', 'Posts'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p><strong>Poçt rabitəsinin milli operatoru (milli operator)</strong> - müvafiq icra hakimiyyəti orqanı tərəfindən universal poçt rabitəsi və poçt-maliyyə xidmətləri göstərilməsi üçün təyin olunmuş poçt operatorudır.</p>
                        <p>&nbsp;</p>
                        <p><strong>Milli operator</strong>&nbsp;maliyyə xidmətlərinin göstərilməsi üzrə fəaliyyəti Azərbaycan Respublikasının Mərkəzi Bankından&nbsp;aldığı xüsusi razılıq (lisenziya) əsasında, lisenziyada müəyyən edilmiş həcmdə həyata keçirə bilər.</p>
                        <p>&nbsp;</p>
                    <?php else: ?>
                        <p style="text-align:justify;"><strong>The national operator of postal communication (the national operator)</strong> – is a postal operator appointed by the relevant executive authority to provide universal postal services and postal financial services.</p>
                        <p style="text-align:justify;"><br><strong>The national operator</strong> may supply financial services on the basis of a special permit (license) issued by Central Bank of the Republic of Azerbaijan in the amount specified in the license.</p>
                        <p>&nbsp;</p>
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