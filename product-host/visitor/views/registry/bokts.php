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
            <?php $this->title = Yii::t('app', 'Bokts'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;"><strong>Bank olmayan kredit təşkilatı</strong> (BOKT) xüsusi razılıq (lisenziya) əsasında kreditlərin verilməsi və “Bank olmayan kredit təşkilatları haqqında” Azərbaycan Respublikasının Qanunu nəzərdə tutulmuş digər fəaliyyət növlərini həyata keçirən ixtisaslaşmış kredit təşkilatıdır.</p>
                        <p style="text-align:justify;"><br>Mərkəzi Bank BOKT-lərin, filialların, şöbələrin və nümayəndəliklərin ictimaiyyət üçün açıq olan mərkəzi <strong>reyestrini</strong> tərtib edir.</p>
                    <?php else: ?>
                        <p style="text-align:justify;"><strong>Non-bank credit institution</strong> (NBCI) – is a specialized credit institution engaged in granting loans under a special permit (license) and other activities specified in the Law of the Republic of Azerbaijan on Non-bank Credit Institutions.</p>
                        <p style="text-align:justify;"><br>The Central Bank maintains a public <strong>register</strong> of NBCIs, branches, departments and representative offices.</p>
                    <?php endif; ?>
                    <div class="download_block assets-pagination">
                        <a target="_blank" href="<?php echo Url::current(['download' => 1]) ?>" class="download_item" download="true">
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