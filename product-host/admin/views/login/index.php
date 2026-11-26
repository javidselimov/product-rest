<?

/* @var $this \yii\web\View
 * @var $content string
 * @var $model admin\viewmodels\LoginViewModel
 */

use yii\widgets\ActiveForm;
use yii\helpers\Html;
use admin\assets\LoginAsset;

LoginAsset::register($this);
$this->beginpage();
?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Developed by GT Solutions">
        <meta name="author" content="GT Solutions">
        <link rel="shortcut icon" href="favicon.ico">
        <title><? echo Yii::$app->params['projectName'] ?></title>
        <? $this->head() ?>
    </head>
    <body class="bg-login">
    <? $this->beginBody() ?>
    <section>
        <div class="container-alt">
            <div class="row">
                <div class="col-sm-12">
                    <div class="wrapper-page">
                        <div class="m-t-40 account-pages bg-white">
                            <div class="text-center account-logo-box">
                                <h2 class="text-uppercase">
                                    <a href="/">Cbar-Admin</a>
                                </h2>
                            </div>
                            <div class="account-content">
                                <? $form = ActiveForm::begin(['enableClientScript' => false, 'options' => ['id' => 'login-form', 'class' => 'form-horizontal']]); ?>
                                <div class="form-group ">
                                    <div class="col-xs-12">
                                        <? echo Html::activeInput('text', $model, 'email', ['placeholder' => 'Email', 'class' => 'form-control', 'autofocus' => 'true']) ?>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-xs-12">
                                        <? echo Html::activeInput('password', $model, 'password', ['placeholder' => Yii::t('model', 'Password'), 'class' => 'form-control']) ?>
                                    </div>
                                </div>
                                <? if ($model->scenario === 'withCaptcha'): ?>
                                    <div class="form-group">
                                        <div class="col-xs-12">
                                            <? echo $form->field($model, 'captcha')->widget(\yii\captcha\Captcha::className(), [
                                                'template' => '<div class="row"><div class="col-lg-5">{image}</div><div class="col-lg-7">{input}</div></div>',
                                                'captchaAction' => 'login/captcha'
                                            ])->label(false) ?>
                                        </div>
                                    </div>
                                <? endif; ?>
                                <div class="form-group ">
                                    <div class="col-xs-12">
                                        <div class="checkbox checkbox-success">
                                            <? echo Html::activeCheckbox($model, 'rememberMe', ['label' => false, 'id' => 'checkbox-signup']) ?>
                                            <label for="checkbox-signup">
                                                <? echo Yii::t('model', 'Remember') ?>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="col-xs-12">
                                        <? if (Yii::$app->session->hasFlash('error')): ?>
                                            <div class="alert alert-danger">
                                                <?= Yii::$app->session->getFlash('error') ?>
                                            </div>
                                        <? endif; ?>
                                        <? if ($model->hasErrors()): ?>
                                            <div class="alert alert-danger">
                                                <? echo $form->errorSummary($model, ['header' => false]); ?>
                                            </div>
                                        <? endif; ?>
                                    </div>
                                </div>
                                <div class="form-group account-btn text-center m-t-10">
                                    <div class="col-xs-12">
                                        <? echo Html::submitButton(Yii::t('app', 'Enter'), ['name' => 'preview', 'class' => 'btn w-md btn-bordered btn-success waves-effect waves-light']); ?>
                                    </div>
                                </div>
                                <? ActiveForm::end(); ?>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    </body>
    <? $this->endBody() ?>
    </html>
<? $this->endPage() ?>