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
            <?php $this->title = Yii::t('app', 'Credit Unions'); ?>
            <div class="content_content clear inner">
                <div class="content_title"><?php echo $this->title ?></div>
                <div class="pjax-content type_text pages-gallery">
                    <?php if (Yii::$app->language === 'az'): ?>
                        <p style="text-align:justify;"><strong>Kredit ittifaqı</strong> mənafe ümumiliyi əsasında könüllü birləşən fiziki şəxslərin və (və ya) kiçik sahibkarlıq subyekti olan hüquqi şəxslərin sərbəst pul vəsaitlərini cəmləşdirmək yolu ilə özlərinin qarşılıqlı kreditləşdirilməsi üçün yaratdıqları bank olmayan kredit təşkilatıdır.</p>
                        <br><p><strong>Kredit ittifaqlarının siyahısı:</strong></p>
                    <?php else: ?>
                        <p style="text-align:justify;"><strong>A credit union</strong> is a non-bank credit institution co-established by individuals and/or small businesses voluntarily united by common interests to combine their disposable financial resources to be used for mutual lending.</p>
                        <br><p><strong>List of Credit Unions:</strong></p>
                    <?php endif; ?>
                    <div class="registry-data">
                        <ol>
                            <?php
                            foreach ($data as $item) {
                                $registryViewModel->renderRegistryItemList($item);
                            }
                            ?>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>