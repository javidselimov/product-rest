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
            <?php $this->title = Yii::t('app', 'Depositaries'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;">Depozitar sistemi qiymətli kağızların sənədsizləşdirilməsi, saxlanılması, uçotu, onlarla təsbit edilmiş hüquqların təsdiqi, öhdəliklərlə yüklənməsi, qiymətli kağız mülkiyyətçilərinin hesablarının uçotunun aparılması, “İnvestisiya fondları haqqında” Azərbaycan Respublikasının Qanunu ilə müəyyən edilmiş qaydada pul hesablarının açılması, həmin hesablar üzrə əməliyyatlar aparılması və pul köçürmələrinin həyata keçirilməsi ilə əlaqədar mərkəzi depozitar və onun üzvləri arasında olan münasibətlər sistemidir. Depozitar fəaliyyəti “Qiymətli Kağızlar Bazarı haqqında“ və&nbsp;“İnvestisiya fondları haqqında” Azərbaycan Respublikasının Qanunları ilə tənzimlənir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Mərkəzi depozitar onun üzvləri olan investisiya şirkətləri və investisiya fondunun depozitarları ilə birlikdə depozitar sistemini təşkil edir. Mərkəzi depozitar depozitar sistemini idarə edən Milli Depozit Mərkəzidir. Milli Depozit Mərkəzi Mərkəzi Bankın təsis etdiyi qeyri-kommersiya hüquqi şəxsdir. Mərkəzi depozitar qiymətli kağızlar üzrə ümümiləşdirilmiş məlumatı, onların mülkiyyətçiləri barədə məlumatlar istisna olmaqla, ictimaiyyət üçün açıqlamalıdır.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Mərkəzi depozitarın vəzifələri aşağıdakılardır:</p>
                        <ul style="text-align:justify;">
                            <li>Qiymətli kağızların saxlanması və uçotunun aparılması;</li>
                            <li>Qiymətli kağız mülkiyyətçilərinin hesablarının uçotunun aparılması;</li>
                            <li>Qiymətli kağızlar və onların mülkiyyətçilərinin hesabları üzrə elektron sistemin təşkilinin və aparılmasının təmin edilməsi;</li>
                            <li>Qiymətli kağız mülkiyyətçilərinin reyestrinin aparılması;</li>
                            <li>Nominal saxlayıcıların hesablarının uçotunun aparılması;</li>
                            <li>Qiymətli kağızların öhdəliklərlə yüklənməsinin qeydiyyatı;</li>
                            <li>Öz üzvlərinə, emitentlərə, fond birjalarına, klirinq təşkilatlarına bu yuxarıda qeyd edilən tutulan vəzifələrlə əlaqədar xidmətlərin göstərilməsi;</li>
                            <li>Müştərilərin sorğusu əsasında hesablarından çıxarışların və aparılmış əməliyyatlar haqqında məlumatların verilməsi;</li>
                            <li>“İnvestisiya fondları haqqında” Azərbaycan Respublikasının Qanunu ilə müəyyən edilmiş vəzifələr.</li>
                        </ul>
                        <p style="text-align:justify;"><a href="http://mdm.gov.az/">http://mdm.gov.az/</a></p>
                        <p style="text-align:justify;">&nbsp;</p>
                    <?php else: ?>
                        <p style="text-align:justify;">The depository system is a system of interactions among the central depository and its members in relation to de-documenting, keeping, accounting securities, confirming the rights they represent, encumbering the securities, maintaining records of accounts of securities holders, opening, operating and making money transfers from accounts in accordance with the Investment Funds Law of Azerbaijan. The depository is governed by the Securities Market Law and the Investment Funds Law of Azerbaijan.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">The central depository, together with members investment companies and the investment fund’s depository, constitutes the depository system. The National Deposit Center manages the depository system. The National Deposit Center is a not-for-profit legal entity established by the financial market supervision authority. The central depository shall disclose generalized information on securities, with their holders anonymized.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Functions of the central depository:</p>
                        <ul>
                            <li style="text-align:justify;">Keeping and accounting of securities;</li>
                            <li style="text-align:justify;">Keeping records of accounts of securities holders;</li>
                            <li style="text-align:justify;">Arranging and managing an electronic system for securities and their holders;</li>
                            <li style="text-align:justify;">Maintaining a registry of securities holders;</li>
                            <li style="text-align:justify;">Keeping records of nominal holders’ accounts;</li>
                            <li style="text-align:justify;">Registering encumbrances of securities;</li>
                            <li style="text-align:justify;">Providing services as related to above functions to its members, issuers, stock exchanges, clearhing houses;</li>
                            <li style="text-align:justify;">Providing account statements and transaction reports at customer’s request;</li>
                            <li style="text-align:justify;">Other functions as may be defined by the Investment Funds Law of Azerbaijan.</li>
                        </ul>
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