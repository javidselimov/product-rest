<?

/* @var $this \yii\web\View
 * @var $formModel visitor\models\LawsForm
 */

use yii\helpers\Html;
use yii\widgets\ActiveForm;
use yii\helpers\Url;
?>
<? $form = ActiveForm::begin(['action' => Url::to(['laws/index']), 'enableClientScript' => false, 'method' => 'get', 'options' => ['autocomplete' => 'off', 'data-pjax' => '1']]); ?>
    <div class="form-row">
        <div class="select-wrap">
            <label for="keyword"><? echo Yii::t('app', 'Laws-Keyword') ?></label>
            <? echo Html::activeInput('text', $formModel, 'keyword') ?>
        </div>
        <div class="select-wrap">
            <label for="searchType"><? echo Yii::t('app', 'Laws-SearchType') ?></label>
            <? echo Html::activeDropDownList($formModel, 'searchType', Yii::t('model', 'Laws-SearchType'), ['value' => !empty($formModel->searchType) ? $formModel->searchType : 1, 'data-default' => 1, 'class' => 'cb-select', 'data-label' => Yii::t('app', 'MEAS Dropdown Empty')]) ?>
        </div>
    </div>
    <div class="form-row">
        <div class="select-wrap">
            <label for="type"><? echo Yii::t('app', 'Laws-Type') ?></label>
            <? echo Html::activeDropDownList($formModel, 'type', Yii::t('model', 'Laws-Types'), ['class' => 'cb-select', 'data-label' => Yii::t('app', 'MEAS Dropdown Empty')]) ?>
        </div>
    </div>
    <input type="submit" class="meas_search_btn" value="<? echo Yii::t('app', 'Search') ?>">
<? ActiveForm::end(); ?>