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
            <?php $this->title = Yii::t('app', 'Investment Companies'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;">İnvestisiya şirkəti investisiya şirkəti fəaliyyəti üçün lisenziyaya malik olan, fəaliyyətinin müstəsna predmeti “Qiymətli kağızlar bazarı haqqında” Qanunun 30.3-cü və 30.4-cü maddələri ilə müəyyən edilmiş əsas və yardımçı investisiya xidmətlərinin göstərilməsi olan səhmdar cəmiyyəti formasında yaradılan hüquqi şəxsdir.</p>
                        <p>&nbsp;</p>
                        <p><strong>Əsas investisiya xidmətləri (əməliyyatları) aşağıdakılardır:</strong></p>
                        <ul>
                            <li style="text-align:justify;"><em>qiymətli kağızlar və ya törəmə maliyyə alətləri ilə aparılan əməliyyatlarla bağlı müştəri sifarişlərinin qəbul və icra edilməsi;</em></li>
                            <li style="text-align:justify;"><em>fərdi investorların portfelinin idarə edilməsi;</em></li>
                            <li style="text-align:justify;"><em>investisiya məsləhətlərinin verilməsi;</em></li>
                            <li style="text-align:justify;"><em>qiymətli kağızların öhdəlik götürmədən yerləşdirilməsi və anderraytinqi;</em></li>
                            <li style="text-align:justify;"><em>qiymətli kağızların öhdəlik götürməklə yerləşdirilməsi və anderraytinqi;</em></li>
                            <li style="text-align:justify;"><em>mərkəzi depozitarın və fond birjasının üzvü qismində öz hesabına qiymətli kağızlar və ya törəmə maliyyə alətləri ilə əməliyyatlar aparılması;</em></li>
                            <li><em>marja ticarəti.</em></li>
                        </ul>
                        <p>&nbsp;</p>
                        <p><strong>Yardımçı investisiya xidmətləri (əməliyyatları) aşağıdakılardır:</strong></p>
                        <ul>
                            <li style="text-align:justify;"><em>müştərisinin qiymətli kağızlar hesablarının idarə edilməsi, o cümlədən qiymətli kağızların və ya törəmə maliyyə alətlərinin öhdəliklərlə yüklənməsi ilə bağlı əməliyyatların həyata keçirilməsi;</em></li>
                            <li style="text-align:justify;"><em>investorlara qiymətli kağızlar və ya törəmə maliyyə alətləri ilə həyata keçirdiyi əqdlərin bağlanması üçün kredit və ya digər formada borc verilməsi;</em></li>
                            <li style="text-align:justify;"><em>qiymətli kağızlar və ya törəmə maliyyə alətləri ilə bağlı investisiya tədqiqatı və maliyyə təhlilinin aparılması;</em></li>
                            <li style="text-align:justify;"><em>təmin edilmiş istiqrazlar üzrə təminatın sərəncamçısı xidmətinin həyata keçirilməsi;</em></li>
                            <li style="text-align:justify;"><em>əsas investisiya xidmətlərinin (əməliyyatlarının) həyata keçirilməsi ilə bağlı xarici valyuta mübadiləsi.</em></li>
                        </ul>
                        <p style="text-align:justify;">&nbsp;</p>
                    <?php else: ?>
                        <p>An investment company is a legal entity incorporated as a joint-stock company licensed to operate as an investment company exclusively to provide core and supporting investment services as defined under the Securities Market Law, Articles 30.3 and 30.4.</p><p>&nbsp;</p><p><strong>Core investment services (operations):</strong></p>
                        <ul>
                            <li><em>accept and process customer orders for securities or financial derivatives transactions;</em></li>
                            <li><em>manage individual investor portfolios;</em></li>
                            <li><em>provide investment advice;</em></li>
                            <li><em>offer and underwrite securities without commitment;</em></li>
                            <li><em>offer and underwrite securities with commitment;</em></li>
                            <li><em>conduct securities or financial derivatives transactions at its own expense as a member of the central depository and the stock exchange;</em></li>
                            <li><em>margin trading.</em></li>
                        </ul><p>&nbsp;</p><p><strong>Supporting investment services (transactions):</strong></p>
                        <ul>
                            <li><em>manage customer securities accounts, including encumbrance of securities or financial derivatives;</em></li>
                            <li><em>loan or otherwise lend funds to investors for securities or financial derivatives transactions;</em></li>
                            <li><em>conduct securities or financial derivatives market studies and financial reviews;</em></li>
                            <li><em>act as the guarantor for guaranteed bonds;</em></li>
                            <li><em>foreign currency exchange as part of core investment services (transactions).</em></li>
                        </ul><p>&nbsp;</p>
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