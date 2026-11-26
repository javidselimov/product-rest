<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\PagesViewModel
 */

use yii\helpers\HtmlPurifier;


$mailSubject = Yii::t('app', 'Project-Name') . ' | ' . $this->title;
$absoluteURL = htmlspecialchars(HtmlPurifier::process(Yii::$app->request->absoluteUrl), ENT_QUOTES, 'utf-8');
?>
<div class="social_icons">
    <div>
        <a href="mailto:?subject=<? echo $mailSubject ?>&body=<? echo $absoluteURL ?>" class="hint--bottom hint--bounce hvr_float" aria-label="Email"><img src="../images/icons/mail.svg" alt=""></a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=<? echo $absoluteURL ?>" target="_blank" title="LinkedIn" class="hvr_float"><img src="../images/icons/linkedin.svg"></a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=<? echo $absoluteURL ?>" target="_blank" class="hint--bottom hint--bounce hvr_float" aria-label="Facebook"><img src="../images/icons/facebook.svg" alt=""></a>
        <a href="https://twitter.com/intent/tweet?url=<? echo $absoluteURL ?>" target="_blank" class="hint--bottom hint--bounce hvr_float" aria-label="X"><img src="../images/icons/x-twitter.svg" alt=""></a>
        <a href="whatsapp://send?text=<? echo $absoluteURL ?>" class="hint--bottom hint--bounce hvr_float" aria-label="WhatsApp"><img src="../images/icons/whatsapp.svg" alt=""></a>
    </div>
    <a href="javascript:;" id="print-page" class="hint--right hint--bounce print_btn" aria-label="print"></a>
</div>