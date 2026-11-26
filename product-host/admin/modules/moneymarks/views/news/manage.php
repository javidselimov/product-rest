<?

/* @var $this \yii\web\View
 * @var $form yii\bootstrap\ActiveForm
 * @var $model admin\modules\moneymarks\viewmodels\MoneyMarksViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\assets\TextEditorAsset;
use admin\helpers\ButtonsHelper;

TextEditorAsset::register($this);

$this->title = Yii::t('app', 'Moneymarks') . ' - ' . Yii::t('app', 'News');
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-lg-12 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <div class="panel-title">
                    <? echo $this->title ?>
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
                                    <? echo ButtonsHelper::returnButton(Url::to(['news/index'])) ?>
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