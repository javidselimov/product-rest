<?

/* @var $this \yii\web\View
 * @var $content string
 */

use yii\helpers\Html;
use admin\assets\MainAsset;
use admin\helpers\Breadcrumbs;

MainAsset::register($this);
$this->beginPage();
?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="author" content="Urmuz Tagizade">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title><? echo Yii::$app->params['projectName'] ?> - <? echo Html::encode($this->title) ?></title>
        <? $this->head() ?>
        <?= Html::csrfMetaTags() ?>
    </head>
    <body class="fixed-left">
    <? $this->beginBody() ?>
    <div id="wrapper">
        <? echo $this->render('header') ?>
        <? echo $this->render('menu') ?>
        <div class="content-page">
            <div class="content">
                <div class="container">
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="page-title-box">
                                <? echo Breadcrumbs::widget(['links' => isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : []]); ?>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                    <? echo $content; ?>
                </div>
            </div>
            <footer class="footer text-right">
                2018 © Developed by GTSolutions.
            </footer>
        </div>
    </div>
    <? $this->endBody() ?>
    </body>
    </html>
<? $this->endPage() ?>