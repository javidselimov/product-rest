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
            <?php $this->title = Yii::t('app', 'Clearing Organizations'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;">Klirinq təşkilatı müstəsna olaraq klirinq fəaliyyəti ilə məşğul olan, bu fəaliyyət növü üzrə lisenziyaya malik olan və səhmdar cəmiyyəti formasında yaradılan hüquqi şəxsdir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Klirinq fəaliyyəti qiymətli kağızlarla və ya törəmə maliyyə alətləri ilə əqdlər üzrə qarşılıqlı öhdəliklərin müəyyən edilməsi məqsədi ilə məlumatların toplanması, yoxlanılması, tutuşdurulması, mövqelərin nettinqi, öhdəliklərin sıralanması, tələblərin əvəzləşdirilməsi üzrə fəaliyyətdir. Klirinq təşkilatı onun üzvləri olan investisiya şirkətləri və banklar ilə birlikdə ticarətsonrası sistemi təşkil edir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Klirinq təşkilatı qiymətli kağızlar və törəmə maliyyə alətləri ilə əməliyyatların icra olunmaması risklərini azaltmaq məqsədi ilə aşağıdakı üsullardan ən azı biri tətbiq etməlidir:</p>
                        <ul><li style="text-align:justify;">aktivlərin əvvəlcədən deponentləşdirilməsi;</li><li style="text-align:justify;">klirinq fondunun yaradılması;</li><li style="text-align:justify;">aktivlərin sığorta etdirilməsi;</li><li style="text-align:justify;">aktivlərin zəmanətlə təmin olunması;</li><li style="text-align:justify;">aktivlərin girovla təmin olunması.</li></ul>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Mərkəzi depozitar müvafiq lisenziya almadan klirinq fəaliyyəti ilə məşğul ola bilər.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;"><a href="http://mdm.gov.az/">http://mdm.gov.az/</a></p>
                    <?php else: ?>
                        <p style="text-align:justify;">A clearing house is a legal entity exclusively engaged in clearing activities, licensed for this type of activity and established as a joint-stock company.</p>
                        <p style="text-align:justify;"><br>Clearing activity is collection, verification and reconciliation of data, netting positions, sorting liabilities, offsetting claims in order to determine mutual liabilities on transactions with securities or derivatives. The clearing house, together with its member investment companies and banks, forms a post-trade system.</p>
                        <p style="text-align:justify;"><br>The clearing house should use at least one of the following methods to reduce the risk of non-performance of transactions with securities and derivatives:</p>
                        <ul><li style="text-align:justify;">prior entry of assets into depo accounts;</li><li style="text-align:justify;">establishment of a clearing fund;</li><li style="text-align:justify;">insurance of assets;</li><li style="text-align:justify;">asset guarantee;</li><li style="text-align:justify;">asset securitization.</li></ul>
                        <p>&nbsp;</p>
                        <p style="text-align:justify;">A central depository may be engaged in clearing activity without obtaining a relevant license.</p>
                        <p style="text-align:justify;"><a href="http://mdm.gov.az/">http://mdm.gov.az/</a></p>
                    <?php endif; ?>
<!--                    <div class="download_block assets-pagination">-->
<!--                        <a href="--><?php //echo Url::current(['download' => 1]) ?><!--" class="download_item" download="true">-->
<!--                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">-->
<!--                            <div>-->
<!--                                <p>--><?php //echo $this->title ?><!--</p>-->
<!--                                <span>--><?php //echo Yii::t('app', 'More-Button') ?><!--</span>-->
<!--                            </div>-->
<!--                        </a>-->
<!--                    </div>-->
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