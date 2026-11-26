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
            <?php $this->title = Yii::t('app', 'Banks'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;">Azərbaycan Respublikasının bank sistemi maliyyə bazarlarına nəzarət orqanı olan Azərbaycan Respublikasının Mərkəzi Bankından (Mərkəzi Bank) və kredit təşkilatlarından ibarətdir.</p>
                        <p style="text-align:justify;"><br/><strong>Bank</strong> - fiziki və hüquqi şəxslərdən depozitlərin və ya digər qaytarılan vəsaitlərin cəlb edilməsi, öz adından və öz hesabına kreditlərin verilməsini, habelə müştərilərin tapşırığı ilə köçürmə və hesablaşma-kassa əməliyyatlarını məcmu halda həyata keçirən hüquqi şəxsdir.</p>
                        <p style="text-align:justify;"><br/>Mərkəzi Bank bankların, filialların, şöbələrin və nümayəndəliklərin ictimaiyyət üçün açıq olan mərkəzi <strong>reyestrini</strong> tərtib edir.</p>
                    <?php else: ?>
                        <p style="text-align:justify;">The banking system of the Republic of Azerbaijan consists of the Central Bank of the Republic of Azerbaijan, as the financial markets supervisory authority, and credit institutions.</p>
                        <p style="text-align:justify;"><br><strong>Bank</strong> – is a legal entity that attracts deposits and other returnable funds from individuals and legal entities, issues loans on its behalf and from its own funds, as well as makes transfers and cash settlements in aggregate at a clients’ requests.</p>
                        <p style="text-align:justify;"><br>The Central Bank maintains a public <strong>register</strong> of banks, branches, departments and representative offices.</p>
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
                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::to(['registry/download', 'endpoint' => 'foreign-banks']) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <?php if (Yii::$app->language === 'az'): ?>
                                    <p>Bank Xarici nümayəndəliklər</p>
                                <?php else: ?>
                                    <p>Bank Foreign offices</p>
                                <?php endif; ?>
                                <span><?php echo $this->title ?></span>
                            </div>
                        </a>
                    </div>
                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::to(['registry/download', 'endpoint' => 'bank-branches']) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <?php if (Yii::$app->language === 'az'): ?>
                                    <p>Bank filialları</p>
                                <?php else: ?>
                                    <p>Bank branches</p>
                                <?php endif; ?>
                                <span><?php echo $this->title ?></span>
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