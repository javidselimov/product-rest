<?

use yii\helpers\Url;
use visitor\widgets\menu\FooterMenuWidget;

?>
<footer class="footer-main">

  <!-- Блок A -->
  <div class="footer-a container">

    <!-- Блок В (логотип) -->
    <div class="footer-v">
      <a href="/">
        <img src="/images/logo-<? echo Yii::$app->language == 'en' ? 'en' : 'az'; ?>.svg?v=2" alt="Logo">
      </a>
    </div>

    <!-- Блок Г (навигация) -->
    <div class="footer-g">
      <h3><? echo Yii::t('footer', 'Navigation') ?></h3>
      <ul>
        <li><?= \common\models\Pages::getPageLinkByID(3) ?></li>
        <li><?= \common\models\Pages::getPageLinkByID(11) ?></li>
        <li><?= \common\models\Pages::getPageLinkByID(56) ?></li>
        <?if (Yii::$app->language == 'az'){?> <li><?= \common\models\Pages::getPageLinkByID(723) ?></li><?}?>
        <li><?= \common\models\Pages::getPageLinkByID(39) ?></li>
        <li><?= \common\models\Pages::getPageLinkByID(46) ?></li>
      </ul>
      <? //echo FooterMenuWidget::widget(['clearMode' => true]); ?>
    </div>

    <!-- Блок Д (контакты) -->
    <div class="footer-d">
      <h3><? echo Yii::t('footer', 'Contact Us') ?></h3>

        <p><strong><? echo Yii::t('footer', 'Adress-Text') ?></strong></p>

      <p><? echo Yii::t('footer', 'Hotline') ?>:<strong class="strong-margin">(+994 12) 966</strong></p>
      <p><? echo Yii::t('footer', 'Phone-First') ?>:<strong class="strong-margin">(+994 12) 493 5058</strong></p>
        <p><? echo Yii::t('footer', 'Phone-Third') ?>:<strong class="strong-margin">(+994 12) 966</strong> (<? echo Yii::t('footer', 'internal') ?> <strong>2243</strong>)</p>

      <a href="https://contact.e-cbar.az/" target="_blank" class="btn"><? echo Yii::t('footer', 'Online-Feedback') ?></a>
      <a href="https://e-cbar.az/Survey" target="_blank" class="btn"><? echo Yii::t('footer', 'Questionary') ?></a>

      <div class="socials">
        <a href="https://www.facebook.com/Az%C9%99rbaycan-Respublikas%C4%B1n%C4%B1n-M%C9%99rk%C9%99zi-Bank%C4%B1-107763107801037" target="_blank">
            <img src="/images/facebook_new.svg" alt="facebook">
        </a>
        <a href="https://www.instagram.com/cbar.az_official" target="_blank">
            <img src="/images/instagram.svg" alt="instagram">
        </a>
        <a href="https://x.com/<? echo Yii::$app->language == 'az' ? 'Merkezi_Bank_AZ' : 'Central_Bank_AZ'; ?>" target="_blank">
            <img src="/images/x.svg" alt="instagram">
        </a>
        <a href="https://t.me/MerkeziBank_AZ" target="_blank">
            <img src="/images/telegram.svg" alt="instagram">
        </a>
        <a href="https://www.youtube.com/@merkezi_bank" target="_blank">
            <img src="/images/youtube_new.svg" alt="youtube">
        </a>
        <a href="https://www.linkedin.com/company/cbaraz" target="_blank">
            <img src="/images/linkedin.svg" alt="linkedin">
        </a>
      </div>
    </div>

  </div>

  <!-- Блок Б -->
  <div class="footer-b container">

    <!-- Блок И -->

    <div class="footer-i">
      <a href="<? echo Url::to(['/pages/index', 'id' => 898, 'slug' => 'privacy-policy']) ?>"><? echo Yii::t('footer', 'Security-Read') ?></a>
    </div>


    <!-- Блок Ж -->
    <div class="footer-j">
      <a href="<? echo Url::to(['/home/sitemap']) ?>"><? echo Yii::t('footer', 'Site Map') ?></a>
    </div>

    <!-- Блок З -->
    <div class="footer-z">
      © <? echo date("Y"); ?> <? echo Yii::t('footer', 'All rights reserved') ?>
    </div>

  </div>
  <a href="javascript:" id="return-to-top"><span class="angle-up"></span></a>
</footer>
