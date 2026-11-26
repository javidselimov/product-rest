<?

/* @var $form yii\bootstrap\ActiveForm
 * @var $formModel visitor\viewmodels\CurrencyRatesViewModel
 */

use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\helpers\Url;

?>

<? $form = ActiveForm::begin(['action' => Url::to(['indeks/rates']), 'enableClientScript' => false, 'method' => 'get', 'options' => ['autocomplete' => 'off', 'data-pjax' => '1']]); ?>
    <div class="filters margin-0">
        <div class="filters-item">
            <div class="date_select">
                <? echo Html::activeInput('text', $formModel, 'dateFrom', ['data-pmu-date' => $formModel['dateFrom'], 'data-pmu-locale' => Yii::$app->language, 'class' => 'date-from white_date', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
            </div>
        </div>
        <div class="filters-item">
            <div class="date_select">
                <? echo Html::activeInput('text', $formModel, 'dateTo', ['data-pmu-date' => $formModel['dateTo'], 'data-pmu-locale' => Yii::$app->language, 'class' => 'date-to white_date', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>

            </div>
        </div>
        <div class="filters-item">
            <div class="table_hand_submit">
                <input type="submit" class="table_submit">
            </div>
        </div>
    </div>
<? ActiveForm::end(); ?>