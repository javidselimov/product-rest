<?
/* @var $model visitor\models\FeedbackForm */

use yii\widgets\Pjax;
use yii\bootstrap\ActiveForm;
use yii\helpers\Html;

$this->title = Yii::t('app', 'Feedback');
?>
<div class="content_wrap">
    <div class="container">
        <div class="content clear">
            <aside><? echo $this->render('//layouts/menu/left') ?></aside>
            <? Pjax::begin(); ?>
            <div class="content_content clear inner white_content">
                <div class="content_title"><? echo Yii::t('app', 'Feedback') ?></div>
                <div class="container-feedback">
                    <div class="wrap">
                        <? Pjax::begin(); ?>
                        <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                        <div class="wrap-input responsive-wrap-input">
                            <? echo Html::activeTextInput($model, 'name', ['class' => 'input', 'placeholder' => Yii::t('model', 'Feedback-Name-Placeholder')]); ?>
                        </div>
                        <div class="wrap-input responsive-wrap-input">
                            <? echo Html::activeTextInput($model, 'email', ['class' => 'input', 'placeholder' => Yii::t('model', 'Feedback-Email-Placeholder')]); ?>
                        </div>
                        <div class="wrap-input">
                            <? echo Html::activeTextInput($model, 'subject', ['class' => 'input', 'placeholder' => Yii::t('model', 'Feedback-Subject-Placeholder')]); ?>
                        </div>
                        <div class="wrap-input">
                            <? echo Html::activeTextarea($model, 'message', ['class' => 'input', 'placeholder' => Yii::t('model', 'Feedback-Message-Placeholder')]); ?>
                        </div>
                        <button type="submit"><? echo Yii::t('app', 'Send-Button') ?></button>
                        <? ActiveForm::end(); ?>
                    </div>
                </div>
                <div class="ajax-preview">
                    <? echo $model->responseMessage ?>
                </div>
            </div>
            <? Pjax::end(); ?>
        </div>
    </div>