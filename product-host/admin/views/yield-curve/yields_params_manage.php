<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\UsersViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\HtmlHelper;
use admin\helpers\ButtonsHelper;


$this->title = Yii::t('app', 'Yield Curve Params');
$this->params['breadcrumbs'][] = $this->title;


?>
<div class="row">
    <div class="col-lg-6 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><i class="mdi mdi-clipboard-account"></i> <? echo Yii::t('app', 'Yield Curve') ?></h3>
            </div>
            <div class="panel-body">
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'period')->fileInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>

                <div class="form-group">
                    <? echo $form->field($model->formModel, 'date')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose']) ?>
                </div>






                <div class="form-group">
                    <? echo ButtonsHelper::submitButton($model->formModel->id) ?>
                    <? echo ButtonsHelper::returnButton(Url::to(['azir/index'])) ?>


                    <?php if($model->formModel->id!=null): ?>
                        <? echo ButtonsHelper::deleteButton($model->formModel->id) ?>
                    <?php endif; ?>
                    <div id="preview-users">
                        <? echo $model->formModel->responseMessage ?>
                    </div>
                </div>
                <? ActiveForm::end(); ?>
                <? Pjax::end(); ?>
            </div>
        </div>
    </div>
</div>


