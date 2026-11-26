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
            <?php $this->title = Yii::t('app', 'Foreign Insurers'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;">Azərbaycan Respublikasının Mərkəzi Bankı “Sığorta fəaliyyəti haqqında” Azərbaycan Respublikası Qanununun 95-ci maddəsinə əsasən sığorta sektorunda dövlət tənzimlənməsini və nəzarəti həyata keçirir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Sığortaçılar, təkrarsığortaçılar, sığorta vasitəçiləri, aktuarilər, müstəqil auditorlar, müstəqil ekspertlər və sığorta sahəsində yardımçı fəaliyyət göstərən hüquqi şəxslər sığorta bazarının peşəkar iştirakçılarıdır.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Azərbaycan Respublikasının Mərkəzi Bankı “Sığorta fəaliyyəti haqqında” Azərbaycan Respublikası Qanununun 95.3-cü maddəsinə əsasən sığortaçıların, sığorta vasitəçilərinin, o cümlədən xarici sığortaçıların və xarici sığorta brokerlərinin, onların Azərbaycan Respublikasındakı nümayəndəliklərinin, aktuarilərin, habelə sığorta sahəsində yardımçı fəaliyyət göstərən hüquqi şəxslərin və müvafiq müstəqil ekspertlərin reyestrini aparır.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;"><strong>Xarici sığortaçı</strong> öz ölkəsinin qanunlarına əsasən sığorta fəaliyyətini həyata keçirmək hüququ olan xarici hüquqi şəxsdir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;"><strong>Xarici təkrarsığortaçı</strong> öz ölkəsinin qanunlarına əsasən təkrarsığorta fəaliyyətini həyata keçirmək hüququ olan xarici hüquqi şəxsdir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                    <?php else: ?>
                        <p style="text-align:justify;">The Central Bank of the Republic of Azerbaijan maintains state regulation and supervision of the insurance sector in accordance with Article 95 of the Law of the Republic of Azerbaijan on Insurance Activity.<br><br>Professional participants of the insurance market include insurers, reinsurers, insurance intermediaries, actuaries, independent auditors, independent experts and legal entities engaged in ancillary insurance.</p>
                        <p style="text-align:justify;"><br>The Central Bank of the Republic of Azerbaijan maintains the register of insurers, insurance intermediaries, including foreign insurers and foreign insurance brokers, their representative offices in the Republic of Azerbaijan, actuaries, as well as legal entities engaged in ancillary insurance and relevant independent experts in accordance with Article 95.3 of the Law of the Republic of Azerbaijan on Insurance Activity.</p>
                        <p style="text-align:justify;"><br><strong>Foreign insurer</strong> is a foreign legal entity that has the right to carry out insurance activities in accordance with the laws of its country.</p>
                        <p style="text-align:justify;"><br><strong>Foreign reinsurer</strong> is a foreign legal entity that has the right to carry out reinsurance activities in accordance with the laws of its country.</p>
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
                </div>
            </div>
        </div>
    </div>
</div>