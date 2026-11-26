<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\UsersViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\HtmlHelper;
use admin\helpers\ButtonsHelper;


$this->title = Yii::t('app', 'Azir Indeksləri');
$this->params['breadcrumbs'][] = $this->title;


?>
<div class="row">
    <div class="col-lg-6 col-md-12 col-xs-12">
        <div class="panel panel-color panel-inverse">
            <div class="panel-heading">
                <h3 class="panel-title"><i class="mdi mdi-clipboard-account"></i> <? echo Yii::t('app', 'Indeks') ?> </h3>
            </div>
            <div class="panel-body">
                <br><p style="color: red">(from 15 may <span style="color: red">"AZIR"</span> replace to <span style="color: red">"1D AZIR"</span>)</p><br>
                <? Pjax::begin(); ?>
                <? $form = ActiveForm::begin(['options' => ['enctype' => 'multipart/form-data', 'data-pjax' => '1']]); ?>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'title_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'title_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>

                <div class="form-group">
                    <? echo $form->field($model->formModel, 'faiz_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'faiz_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'eqd_hecm_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'eqd_hecm_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'eqd_hecm_usd')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'eqd_say_az')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'eqd_say_en')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                </div>
                <div class="form-group">
                    <? echo $form->field($model->formModel, 'date')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose']) ?>
                </div>
                <div class="form-group">
                    <?= $form->field($model->formModel, 'order_column')->input('number', ['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control', 'value' => $model->formModel->getAttribute('order_column') ?? 0]) ?>
                </div>
                <div class="form-group">


                    <label for="">
                        Ana Sehifede goster
                        <input type="checkbox" value="1" name="home_view" <?php if($model->formModel->getAttribute('home_view')==1): ?> checked <?php endif; ?>>
                    </label>

                </div>
                <div class="form-group">
                    <label for="">
                        Ana sehifedeki Tarixi Bundan gotur
                        <input type="checkbox" value="1" name="date_view"  <?php if($model->formModel->getAttribute('date_view')==1): ?> checked <?php endif; ?>>
                    </label>
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
