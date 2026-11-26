<?php
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;

$this->title = Yii::t('app', 'Pdf Azir uploader');
?>

<div class="azir-upload">
    <h3><?= Html::encode($this->title) ?></h3>

    <?php Pjax::begin(); ?>
    <?php $form = ActiveForm::begin([
        'options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']
    ]); ?>

    <?= $form->field($model, 'file')->fileInput() ?>

    <div class="form-group">
        <?= Html::submitButton(Yii::t('app', 'Download'), ['class' => 'btn btn-primary']) ?>
    </div>

    <?php ActiveForm::end(); ?>

    <div id="upload-response">
        <?= $model->responseMessage ?? '' ?>
    </div>
    <?php Pjax::end(); ?>
</div>
