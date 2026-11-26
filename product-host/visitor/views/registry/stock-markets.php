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
            <?php $this->title = Yii::t('app', 'Stock Markets'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;"><strong>Fond birjası&nbsp;</strong>&nbsp;- fond birjası fəaliyyəti üçün lisenziyaya malik olan, fəaliyyətinin müstəsna predmeti tənzimlənən bazarların təşkili və idarə edilməsi olan, səhmdar cəmiyyəti formasında yaradılan hüquqi şəxsdir. Fond birjası dövlət qiymətli kağızları bazarının, korporativ qiymətli kağızlar bazarının və törəmə maliyyə alətləri bazarının ticarətini təşkil edir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Qiymətli kağızlar və törəmə maliyyə alətləri üzrə kütləvi ticarət yalnız qiymətli kağızların və törəmə maliyyə alətlərinin fond birjasının daxili qaydalarına əsasən kütləvi ticarətə qəbulundan sonra həyata keçirilir. Kütləvi ticarət qiymətli kağızlar və ya törəmə maliyyə alətlərinin qeyri-məhdud sayda alıcılara ilkin və ya təkrar təklifi nəticəsində bağlanan əqdlərdir. Kütləvi ticarətə qəbul olunmuş qiymətli kağızlar və törəmə maliyyə alətləri tənzimlənən bazarda yalnız investisiya şirkətlərinin vasitəçiliyi ilə alınıb-satılır.</p>
                        <p>&nbsp;</p>
                        <p>Fond birjasının vəzifələri aşağıdakılardır:</p>
                        <ul>
                            <li>təşkil etdiyi ticarətin ədalətliliyinin və şəffaflığının təmin edilməsi;</li>
                            <li>öz daxili qaydaları ilə üzvlərinin ticarətdə birbaşa və (və ya) məsafədən qoşulmaqla iştirakının təmin edilməsi;</li>
                            <li>qiymətli kağızlarla və törəmə maliyyə alətləri ilə ticarətin təşkili və keçirilməsi;</li>
                            <li>ticarət sistemlərinin istismarı və dəstəklənməsi;</li>
                            <li>qiymətli kağızların kütləvi təklifinin və yerləşdirilməsinin təşkili;</li>
                            <li>fond birjasında ticarətə qəbul edilən törəmə maliyyə alətlərinə, qiymətli kağızlara və onların emitentlərinə tələblərin müəyyən edilməsi;</li>
                            <li>öz üzvlərinə fond birjasında ticarət aparmaq üçün ticarət sistemlərinə çıxış verilməsi;</li>
                            <li>ticarət sistemində bağlanmış əqdlərin monitorinqinin aparılması;</li>
                            <li>öz üzvlərinin fond birjasında fəaliyyəti ilə bağlı maliyyə vəziyyətinin monitorinqinin aparılması.</li>
                        </ul>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Hal-hazırda Azərbaycan Respublikası ərazisində yeganə fond birjası&nbsp;Bakı Fond Birjasıdır<a href="http://www.bfb.az">&nbsp;http://bfb.az/</a></p>
                        <p style="text-align:justify;">&nbsp;</p>
                    <?php else: ?>
                        <p style="text-align:justify;"><strong>Stock Exchange</strong> is a legal entity created as a joint stock company for organizing and managing the regulated markets with a stock exchange license. Stock exchange organizes the mass trading of state securities, corporate securities and derivatives.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">Currently, there is only one stock exchange in Azerbaijan, which is&nbsp;Baku Stock Exchange&nbsp;<a href="http://www.bfb.az">&nbsp;http://bfb.az/</a>. </p>
                        <p style="text-align:justify;">&nbsp;</p>
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