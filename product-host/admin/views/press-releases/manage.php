<?

/* @var $this \yii\web\View
 * @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\PressReleasesViewModel
 */

use yii\helpers\ArrayHelper;
use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\assets\TextEditorAsset;
use admin\assets\FancyboxAsset;
use admin\helpers\ButtonsHelper;

TextEditorAsset::register($this);
FancyboxAsset::register($this);

$this->title = ArrayHelper::getValue(Yii::t('other', 'press-releases-types'), $model->formModel->type);
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-12 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <div class="panel-title">
                    <? echo $this->title ?>
                    <? if (!$model->formModel->isNewRecord): ?>
                        <div class="pull-right">
                            <span style="color: red; font-size:11px">image size 1200:900 (4:3)</span>
                            <button type="button" data-src="<?= Url::to(['press-releases/assets', 'pageID' => $model->formModel->id]) ?>" data-width="1100" data-height="900" data-fancybox="data-fancybox" class="btn btn-teal fancybox" title="<?= Yii::t('app', 'Pages-Assets') ?>">
                                <i class="glyphicon glyphicon-picture"></i>
                            </button>
                        </div>
                    <? endif; ?>
                </div>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="grid-container">
                            <div class="row">
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'title_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'title_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'date')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'content_az')->textarea(['class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo $form->field($model->formModel, 'content_en')->textarea(['class' => 'form-control']) ?>
                                </div>
                                <div class="form-group">
                                    <? echo ButtonsHelper::submitButton($model->formModel->id) ?>
                                    <? echo ButtonsHelper::returnButton(Url::to(['press-releases/index', 'type' => $model->formModel->type])) ?>
                                    <? if ($model->formModel->id and !$model->formModel->isNewRecord) echo ButtonsHelper::deleteButton($model->formModel->id); ?>
                                    <div id="preview-edit"><? echo $model->formModel->responseMessage ?></div>
                                </div>
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