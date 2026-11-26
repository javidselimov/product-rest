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
            <?php $this->title = Yii::t('app', 'Investment Funds'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;">“İnvestisiya fondu səhmdar və ya paylı investisiya fondu formasında yaradılan, vəsaitlərin cəlb edilib mənfəət əldə edilməsi məqsədi ilə investisiya bəyannaməsində nəzərdə tutulmuş qaydada yatırılması ilə məşğul olan maliyyə qurumudur.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;"><strong>Səhmdar investisiya fondu</strong> səhmdar investisiya fondu fəaliyyəti üçün lisenziyaya malik olan, fəaliyyətinin müstəsna predmeti səhmlərinin yerləşdirilməsindən əldə edilən pul vəsaitlərinin investisiya bəyannaməsi ilə nəzərdə tutulmuş qaydada qiymətli kağızlara və digər əmlaka yatırılmasından mənfəət əldə edilməsi olan açıq səhmdar cəmiyyətidir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;"><strong>Paylı investisiya fondu</strong> ümumi paylı mülkiyyət hüququ əsasında investisiya fond paylarının sahiblərinə məxsus və investisiya fondunun idarəçisinin idarəetməsində olan əmlak toplusudur. Paylı investisiya fondu hüquqi şəxs statusuna malik deyil və onun aktivləri paylarının satışından daxil olan pul vəsaitlərindən, həmin vəsaitlərin investisiyası nəticəsində əldə olunan digər aktivlərdən ibarətdir. Paylı investisiya fondu açıq, qapalı və interval formada yaradıla bilər.</p>
                        <p style="text-align:justify;"><br><strong>İnvestisiya fondunun idarəçisi</strong> müstəsna olaraq investisiya fondlarının idarə edilməsi fəaliyyəti ilə məşğul olan və bu fəaliyyət növü üzrə lisenziyaya malik hüquqi şəxsdir. İnvestisiya fondunun idarəçisi investisiya fondunu səhmdar investisiya fondu və ya pay sahibləri ilə bağlanılmış idarəetmə müqaviləsi əsasında səhmdarların və ya pay sahiblərinin maraqlarına uyğun olaraq idarə edir.</p>
                        <p style="text-align:justify;">&nbsp;</p>
                        <p style="text-align:justify;">İnvestisiya fondunun idarəçisinin vəzifələri aşağıdakılardır:</p>
                        <ul>
                            <li style="text-align:justify;">fondun aktivlərini formalaşdırmaq və idarə etmək;</li>
                            <li style="text-align:justify;">investisiya fondunun aktivlərinin ümumi dəyərinin, hərəkətinin və tərkibinin uçotunu aparmaq, habelə payların cari dəyərini hesablamaq;</li>
                            <li style="text-align:justify;">paylı investisiya fondunun aktivlərinin ayrıca mühasibat uçotunu aparmaq və qanunvericiliklə müəyyən olunmuş qaydada maliyyə bazarlarına nəzarət orqanına hesabatlar təqdim etmək;[32]</li>
                            <li style="text-align:justify;">investisiya fondunun aktivlərinin dəyərini, hərəkətini və tərkibini depozitarlarla üzləşdirmək:</li>
                            <li style="text-align:justify;">ayda azı bir dəfə səhmdar investisiya fondunu və ya paylı investisiya fondunun pay sahiblərini fondun xalis aktivlərinin tərkibi və dəyəri, habelə idarəetmə müqaviləsinə və ya fondun qaydalarına uyğun olaraq bir payın cari dəyəri haqqında müntəzəm olaraq məlumatlandırmaq.<br><br></li>
                        </ul>
                        <p style="text-align:justify;">&nbsp;</p><p style="text-align:justify;"><strong>İnvestisiya fondunun idarəçisi</strong>&nbsp;isə müstəsna olaraq investisiya fondlarının idarə edilməsi fəaliyyəti ilə məşğul olan və bu fəaliyyət növü üzrə lisenziyaya malik hüquqi şəxsdir;</p><p style="text-align:justify;">&nbsp;</p><p style="text-align:justify;"><strong>İnvestisiya fondunun idarəçisi fəaliyyəti üzrə lisenziyaya malik şirkətlərin siyahısı:</strong></p>

                    <?php else: ?>
                        <p style="text-align:justify;">The Central Bank of the Republic of Azerbaijan maintains state regulation and supervision of the insurance sector in accordance with Article 95 of the Law of the Republic of Azerbaijan on Insurance Activity.</p>
                        <p style="text-align:justify;"><br>Professional participants of the insurance market include insurers, reinsurers, insurance intermediaries, actuaries, independent auditors, independent experts and legal entities engaged in ancillary insurance.</p>
                        <p style="text-align:justify;"><br>The Central Bank of the Republic of Azerbaijan maintains the register of insurers, insurance intermediaries, including foreign insurers and foreign insurance brokers, their representative offices in the Republic of Azerbaijan, actuaries, as well as legal entities engaged in ancillary insurance and relevant independent experts in accordance with Article 95.3 of the Law of the Republic of Azerbaijan on Insurance Activity.</p>
                        <p style="text-align:justify;"><br><strong>Insurer</strong> is the local legal entity, with a relevant license to implement insurance activity which is the party of an insurance agreement liable to pay an insurance indemnity as specified in compulsory insurance regulations or agreements in case an insurance event specified in the insurance agreement happens.</p>
                        <p style="text-align:justify;"><br><strong>Reinsurer</strong> is the party with a reinsurance license, that reinsures (accepts to reinsurance) insured (reinsured) risks on the basis of insurance or reinsurance agreements signed by original insurers or reinsurers.</p>
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