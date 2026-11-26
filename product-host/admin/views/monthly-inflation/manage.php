<?
/* @var $form yii\bootstrap\ActiveForm
 * @var $model common\models\MonthlyInflationParameters
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'Monthly Inflation Parameters');
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
                <? $form = ActiveForm::begin(['options' => ['data-pjax' => '1']]); ?>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="row">
                            <div class="form-group">
                                <? echo $form->field($model, 'current_inflation')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($model, 'target_inflation')->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                            </div>
                            <div class="form-group">
                                <? echo $form->field($model, 'next_update_date')->textInput(['placeholder' => 'YYYY-MM-DD', 'class' => 'form-control datepicker-autoclose']) ?>
                            </div>
                            <div class="form-group">
                                <? echo ButtonsHelper::submitButton($model->id) ?>
                                <? echo ButtonsHelper::returnButton(Url::to(['home/index'])) ?>
                                <div id="preview-inflation-edit"><? echo $model->responseMessage ?></div>
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
