<?
use yii\helpers\Url;
?>
<nav id="menu" class="mobile-menu">
    <script>
        window.YiiSearchPlaceholder = "<?= Yii::t('app', 'Search') ?>";
        window.YiiSearchUrl = "<?= Url::to(['/search/index']) ?>";
    </script>
    <? echo \visitor\widgets\menu\CombinedMobileMenuWidget::widget(); ?>
    <ul class="mh-menu-extra">
        <li>
            <div class="ctegory_search meas_block">
                <select class="formstyler auto-redirect" onchange="if (this.value) window.location.href=this.value;">
                    <option value=""><? echo Yii::t('app', 'MEAS') ?></option>
                    <option value="<? echo Url::to(['meas/index']) ?>"><? echo Yii::t('app', 'MEAS Page') ?></option>
                    <option value="/page-182/about-esid"><? echo Yii::t('app', 'MEAS About') ?></option>
                </select>
            </div>
        </li>
        <li>
            <a href="tel:966" class="header_hotline hint--bottom hint--bounce semi-bold blue" aria-label="<? echo Yii::t('footer', 'Hotline') ?>"><img src="/images/phone-receiver.svg"/>966</a>
        </li>
        <li>
            <div class="lang">
                <? if (Yii::$app->language == 'az'): ?>
                    <a href="<? echo Url::current(['language' => 'en']) ?>">EN</a>
                <? else: ?>
                    <a href="<? echo Url::current(['language' => 'az']) ?>">AZ</a>
                <? endif; ?>
            </div>
        </li>
    </ul>
</nav>