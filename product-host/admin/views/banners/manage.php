<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\BannersViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\HtmlHelper;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'Banners');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-6 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><? echo $this->title ?></h3>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="row">
                            <div class="form-group">
                                <? echo $form->field($model, 'title_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($model, 'title_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <?/*
                            <div class="form-group m-b-25">
                                <?
                                echo HtmlHelper::showImagePreview($model->background, ['folder' => 'banners']);
                                echo $form->field($model, 'background')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]);
                                ?>
                            </div>
                            */?>
                            <div class="form-group">
                                <? echo $form->field($model, 'url')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group touchspin-panel">
                                <? echo $form->field($model, 'position')->textInput(['placeholder' => '1', 'class' => 'form-control touchspin']) ?>
                            </div>
                            <div class="form-group checkbox checkbox-success m-b-20">
                                <? echo $form->field($model, 'clean', ['template' => "{input}\n{label}"])->checkbox(false, false) ?>
                            </div>
                            <div class="form-group">
                                <? echo ButtonsHelper::submitButton($model->id) ?>
                                <? echo ButtonsHelper::returnButton(Url::to(['banners/index'])) ?>
                                <? if ($model->id and !$model->isNewRecord):
                                    echo ButtonsHelper::deleteButton($model->id);
                                endif;
                                ?>
                                <div id="preview-currency-edit"><? echo $model->responseMessage ?></div>
                            </div>
                        </div>
                    </div>
                </div>
                <? ActiveForm::end(); ?>
                <? Pjax::end(); ?>
            </div>
        </div>
    </div>
</div>