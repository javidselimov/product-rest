<?

/* @var $this \yii\web\View
 * @var $content string
 */

use admin\assets\PopupAsset;

PopupAsset::register($this);
$this->beginPage();
?>
    <!DOCTYPE html>
    <html>
    <head>
        <? $this->head() ?>
    </head>
    <? $this->beginBody() ?>
    <body class="fixed-left">
    <div class="popup-wrapper">
        <? echo $content; ?>
    </div>
    <? $this->endBody() ?>
    </body>
    </html>
<? $this->endPage() ?>