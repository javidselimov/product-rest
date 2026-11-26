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
            <?php $this->title = Yii::t('app', 'Insurance Intermediaries'); ?>
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
                        <p style="text-align:justify;">Sığortaçı ilə bağladığı tapşırıq müqaviləsində başqa cür nəzərdə tutulmamışdırsa, <strong>sığorta agenti</strong> sığortaçının adından və onun verdiyi səlahiyyətlər daxilində sığorta müqavilələrinin bağlanmasında, davam etdirilməsində və ya yenilənməsində, habelə tərəflər arasında danışıqların aparılmasında vasitəçilik fəaliyyəti göstərən fiziki, yaxud hüquqi şəxsdir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;"><strong>Sığorta brokeri</strong> sığorta məsələləri, o cümlədən danışıqların aparılması, sığorta müqaviləsinin davam etdirilməsi və ya yenilənməsi, risklərin yerləşdirilməsi ilə əlaqədar vasitəçilik fəaliyyəti göstərən, sığorta müqavilələrinin bağlanmasına və sığorta tələbinə dair məsləhətlər verən fiziki, yaxud hüquqi şəxsdir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                    <?php else: ?>
                        <p style="text-align:justify;">The Central Bank of the Republic of Azerbaijan maintains state regulation and supervision of the insurance sector in accordance with Article 95 of the Law of the Republic of Azerbaijan on Insurance Activity.</p>
                        <p style="text-align:justify;"><br>Professional participants of the insurance market include insurers, reinsurers, insurance intermediaries, actuaries, independent auditors, independent experts and legal entities engaged in ancillary insurance.</p>
                        <p style="text-align:justify;"><br>The Central Bank of the Republic of Azerbaijan maintains the register of insurers, insurance intermediaries, including foreign insurers and foreign insurance brokers, their representative offices in the Republic of Azerbaijan, actuaries, as well as legal entities engaged in ancillary insurance and relevant independent experts in accordance with Article 95.3 of the Law of the Republic of Azerbaijan on Insurance Activity.</p>
                        <p style="text-align:justify;"><br>Unless otherwise provided by the assignment agreement concluded with the insurer, <strong>the insurance agent</strong> is an individual or a legal person acting as an intermediary in concluding, continuing or renewing insurance contracts on behalf of the insurer and within the powers it issues, as well as intermediating in negotiations between the parties.</p>
                        <p style="text-align:justify;"><br><strong>An insurance broker</strong> is an individual, or legal entity that intermediates on insurance issues, including negotiating, continuing or renewing insurance agreements and allocation of risks; and consults on signing insurance agreements and insurance claims.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                    <?php endif; ?>

                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::to(['registry/download', 'endpoint' => 'individual-agents']) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <?php if (Yii::$app->language === 'az'): ?>
                                    <p>Fiziki şəxs olan sığorta agenti</p>
                                <?php else: ?>
                                    <p>Individual Insurance Agents</p>
                                <?php endif; ?>
                                <span><?php echo $this->title ?></span>
                            </div>
                        </a>
                    </div>
                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::to(['registry/download', 'endpoint' => 'individual-brokers']) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <?php if (Yii::$app->language === 'az'): ?>
                                    <p>Fiziki şəxs olan sığorta brokerləri</p>
                                <?php else: ?>
                                    <p>Legal Entity Insurance Agents</p>
                                <?php endif; ?>
                                <span><?php echo $this->title ?></span>
                            </div>
                        </a>
                    </div>
                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::to(['registry/download', 'endpoint' => 'legal-agents']) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <?php if (Yii::$app->language === 'az'): ?>
                                    <p>Hüquqi şəxs olan sığorta agentləri</p>
                                <?php else: ?>
                                    <p>Legal Entity Insurance Brokers</p>
                                <?php endif; ?>
                                <span><?php echo $this->title ?></span>
                            </div>
                        </a>
                    </div>
                    <div class="download_block assets-pagination">
                        <a href="<?php echo Url::to(['registry/download', 'endpoint' => 'legal-brokers']) ?>" class="download_item" download="true">
                            <img src="/images/icons/xlsx.svg" width="60px" alt="" style="max-width: 100%;">
                            <div>
                                <?php if (Yii::$app->language === 'az'): ?>
                                    <p>Hüquqi şəxs olan sığorta brokerləri</p>
                                <?php else: ?>
                                    <p>Individual Insurance Brokers</p>
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