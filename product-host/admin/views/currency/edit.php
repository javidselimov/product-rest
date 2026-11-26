<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $model admin\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\Url;
use yii\widgets\ActiveForm;
use yii\widgets\Pjax;
use admin\helpers\ButtonsHelper;

$this->title = Yii::t('app', 'Edit-Currency') . ' - ' . Yii::$app->formatter->asDate($model->date, 'long');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Currency-Rates'), 'url' => ['currency/rates']];
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
                    <div class="col-lg-12">
                        <div class="row">
                            <? foreach ($model->attributes() as $attribute):
                                if (strlen($attribute) == 3):
                                    ?>
                                    <div class="col-lg-3">
                                        <div class="form-group">
                                            <? echo $form->field($model, $attribute)->textInput(['placeholder' => Yii::t('model', 'Empty-Input'), 'class' => 'form-control']) ?>
                                        </div>
                                    </div>
                                <? endif;endforeach; ?>
                        </div>
                        <div class="form-group">
                            <? echo $form->field($model, 'date')->hiddenInput()->label(false); ?>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <? echo ButtonsHelper::submitButton($model->id) ?>
                    <? echo ButtonsHelper::returnButton(Url::to(['currency/rates'])) ?>
                    <? echo ButtonsHelper::deleteButton($model->id) ?>
                    <div id="preview-currency-edit"><? echo $model->responseMessage ?></div>
                </div>
                <? ActiveForm::end(); ?>
                <? Pjax::end(); ?>
            </div>
        </div>
    </div>
</div>