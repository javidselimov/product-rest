<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\VideosViewModel
 * @var $formModel admin\viewmodels\VideosViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\assets\TextEditorAsset;
use admin\helpers\ButtonsHelper;

TextEditorAsset::register($this);

$this->title = Yii::t('app', 'Video-Gallery');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-12 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><? echo $this->title ?></h3>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-6">
                        <div class="grid-container">
                            <div class="row">
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'title_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'title_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'url')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="grid-container">
                            <div class="form-group">
                                <? echo $form->field($model->formModel, 'date')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose']) ?>
                            </div>
                            <div class="form-group touchspin-panel">
                                <? echo $form->field($formModel, 'position')->textInput(['placeholder' => '1', 'class' => 'form-control touchspin']) ?>
                            </div>
                            <div class="form-group">
                                <? echo ButtonsHelper::submitButton($formModel->id) ?>
                                <? echo ButtonsHelper::returnButton(Url::to(['videos/index'])) ?>
                                <? if ($formModel->id and !$formModel->isNewRecord):
                                    echo ButtonsHelper::deleteButton($formModel->id);
                                endif;
                                ?>
                                <div id="preview-currency-edit"><? echo $formModel->responseMessage ?></div>
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