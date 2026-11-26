<?

/* @var $this \yii\web\View
 * @var $content string
 */

use yii\helpers\Html;
use visitor\assets\CoreAsset;

CoreAsset::register($this);
$this->beginPage();
?>
    <!DOCTYPE html>
    <html lang="<? echo Yii::$app->language ?>">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="author" content="Central Bank of the Republic of Azerbaijan">
        <title><? echo Yii::t('app', 'Project-Name') ?> - <? echo Html::encode($this->title) ?></title>
        <? $this->head() ?>
        <? echo Html::csrfMetaTags() ?>
    </head>
    <body>
    <? $this->beginBody() ?>
    <? echo $this->render('menu/mobile') ?>
    <div class="wraper">
        <? echo $this->render('header') ?>
        <? echo $this->render('menu/top') ?>
        
        <? echo $this->render('_news_slider') ?>
        
        <!-- Выводим контент -->
        <? echo $content; ?>
        <? echo $this->render('banners') ?>
        <? echo $this->render('footer') ?>
    </div>
    <? $this->endBody() ?>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-131131414-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'UA-131131414-1');
    </script>

    </body>
    </html>
<? $this->endPage() ?>