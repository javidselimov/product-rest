<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'New-Currency');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Currency-Rates'), 'url' => ['currency/rates']];
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
                <div class="form-group">
                    <? echo Html::activeTextInput($model, 'date', ['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control datepicker-autoclose']) ?>
                </div>
                <div class="form-group m-b-25">
                    <? echo $form->field($model, 'xlsxFile')->fileInput(['class' => 'filestyle', 'data-input' => 'false', 'data-buttontext' => Yii::t('model', 'Empty-FileInput')]); ?>
                </div>
                <div class="form-group">
                    <? echo ButtonsHelper::submitButton($model->id) ?>
                    <? echo ButtonsHelper::returnButton(Url::to(['currency/rates'])) ?>
                    <div id="preview-currency-add"><? echo $model->responseMessage ?></div>
                </div>
                <? ActiveForm::end(); ?>
                <? Pjax::end(); ?>
            </div>
        </div>
    </div>
</div>