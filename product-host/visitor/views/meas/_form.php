<?

/* @var $this \yii\web\View
 * @var $formModel visitor\models\MeasForm
 * @var $model visitor\viewmodels\MeasViewModel
 */

use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\helpers\Url;
?>
<? $form = ActiveForm::begin(['action' => Url::to(['meas/index']), 'enableClientScript' => false, 'method' => 'get', 'options' => ['autocomplete' => 'off', 'data-pjax' => '1']]); ?>
    <div class="select-wrap">
        <label for="emitent"><? echo Yii::t('model', 'Emitent-ID') ?></label>
        <? echo Html::activeDropDownList($formModel, 'emitent', ArrayHelper::map($model->measEmitentModel->getAllEmitents(), 'id', 'name_' . Yii::$app->language), ['class' => 'cb-select', 'data-label' => Yii::t('app', 'MEAS Dropdown Empty')]) ?>
    </div>
    <div class="select-wrap">
        <label for="infoType"><? echo Yii::t('model', 'Info-Type-ID') ?></label>
        <? echo Html::activeDropDownList($formModel, 'infoType', ArrayHelper::map($model->measInfoTypeModel->getAllInfoTypes(), 'id', 'name_' . Yii::$app->language), ['class' => 'cb-select', 'data-label' => Yii::t('app', 'MEAS Dropdown Empty')]) ?>
    </div>
    <div class="form-row">
        <div class="select-wrap">
            <label for="search-datefrom"><? echo Yii::t('model', 'Date-From') ?></label>
            <div class="date_select">
                <? echo Html::activeInput('text', $formModel, 'dateFrom', ['data-pmu-date' => $formModel['dateFrom'], 'data-pmu-locale' => Yii::$app->language, 'class' => 'table_input date-meas-from', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
            </div>
        </div>
        <div class="select-wrap">
            <label for="search-dateto"><? echo Yii::t('model', 'Date-To') ?></label>
            <div class="date_select">
                <? echo Html::activeInput('text', $formModel, 'dateTo', ['data-pmu-date' => $formModel['dateTo'], 'data-pmu-locale' => Yii::$app->language, 'class' => 'table_input date-meas-to', 'data-pmu-format' => 'd/m/Y', 'autocomplete' => 'off']) ?>
            </div>
        </div>
    </div>
    <div class="form-row">
        <div class="select-wrap">
            <label for="dqn"><? echo Yii::t('model', 'DQN') ?></label>
            <? echo Html::activeInput('text', $formModel, 'dqn') ?>
        </div>
        <div class="select-wrap">
            <label for="docType"><? echo Yii::t('model', 'Doc-Type-ID') ?></label>
            <? echo Html::activeDropDownList($formModel, 'docType', Yii::t('model', 'MEAS-Document-Types'), ['class' => 'cb-select', 'data-label' => Yii::t('app', 'MEAS Dropdown Empty')]) ?>
        </div>
    </div>
    <input type="submit" class="meas_search_btn" value="<? echo Yii::t('app', 'Search') ?>">
<? ActiveForm::end(); ?>