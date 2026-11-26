<?

/* @var $this \yii\web\View
 * @var $model visitor\viewmodels\PressReleasesViewModel
 */

use yii\widgets\ActiveForm;
use yii\helpers\Url;
use yii\helpers\Html;

?>
<? $form = ActiveForm::begin(['action' => Url::to(['press-releases/index']), 'enableClientScript' => false, 'method' => 'get', 'options' => ['autocomplete' => 'off', 'data-pjax' => '1']]); ?>
    <div class="filters">
        <div class="filters-item">
            <div class="date_select">
                <? echo Html::activeInput('text', $model->formModel, 'dateFrom', ['data-pmu-locale' => Yii::$app->language, 'data-pmu-date' => $model->formModel['dateFrom'], 'class' => 'date-from white_date', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
            </div>
        </div>
        <div class="filters-item">
            <div class="date_select">
                <? echo Html::activeInput('text', $model->formModel, 'dateTo', ['data-pmu-locale' => Yii::$app->language, 'data-pmu-date' => $model->formModel['dateTo'], 'class' => 'date-to white_date', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
            </div>
        </div>
        <div class="filters-item">
            <div class="table_hand_submit">
                <? echo Html::activeHiddenInput($model->formModel, 'type') ?>
                <input type="submit" class="table_submit">
            </div>
        </div>
    </div>
<? ActiveForm::end(); ?>