<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $formModel visitor\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\helpers\Url;
?>

<? $form = ActiveForm::begin(['action' => Url::to(['currency/custom']), 'enableClientScript' => false, 'options' => ['autocomplete' => 'off']]); ?>
    <div class="table_head">
        <div class="table_hand_input">
            <? echo Html::activeInput('text', $formModel, 'dateFrom', ['data-pmu-date' => $formModel['dateFrom'], 'data-pmu-locale' => Yii::$app->language, 'class' => 'table_input date-from', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
        </div>
        <div class="table_hand_input">
            <? echo Html::activeInput('text', $formModel, 'dateTo', ['data-pmu-date' => $formModel['dateTo'], 'data-pmu-locale' => Yii::$app->language, 'class' => 'table_input date-to', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
        </div>
        <div class="table_hand_input">
            <? echo Html::activeDropDownList($formModel, 'currencyCode', Yii::t('other', 'currencies'), ['class' => 'formstyler']) ?>
        </div>
        <div class="table_hand_submit">
            <input type="submit" class="table_submit">
        </div>
    </div>
<? ActiveForm::end(); ?>