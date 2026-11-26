<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\modules\meas\viewmodels\MeasViewModel
 * @var $formModel common\models\Meas
 */

use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'MEAS');
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
                                <? echo $form->field($formModel, 'emitent_id')->dropDownList(ArrayHelper::map($model->measEmitentModel->getAllEmitents(), 'id', 'name_az'), ['prompt' => Yii::t('model', 'Empty-Dropdown')]) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($formModel, 'info_type_id')->dropDownList(ArrayHelper::map($model->measInfoTypeModel->getAllInfoTypes(), 'id', 'name_az'), ['prompt' => Yii::t('model', 'Empty-Dropdown')]) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($formModel, 'doc_type_id')->dropDownList(Yii::t('model', 'MEAS-Document-Types'), ['prompt' => Yii::t('model', 'Empty-Dropdown')]) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($formModel, 'dqn')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($formModel, 'reg_date')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose', 'autocomplete' => 'off']) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($formModel, 'file_path')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]); ?>
                            </div>
                            <div class="form-group">
                                <? echo ButtonsHelper::submitButton($formModel->id) ?>
                                <? echo ButtonsHelper::returnButton(Url::to(['/meas/default/index'])) ?>
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