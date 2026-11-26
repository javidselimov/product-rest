<?

use kartik\form\ActiveForm;
use kartik\tree\Module;
use kartik\tree\TreeView;
use kartik\tree\models\Tree;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\helpers\Json;
use yii\web\View;

/**
 * @var View $this
 * @var Tree $node
 * @var ActiveForm $form
 * @var array $formOptions
 * @var string $keyAttribute
 * @var string $nameAttribute
 * @var string $action
 * @var array $breadcrumbs
 * @var array $nodeAddlViews
 * @var mixed $currUrl
 * @var boolean $showIDAttribute
 * @var boolean $showNameAttribute
 * @var boolean $showFormButtons
 * @var boolean $allowNewRoots
 * @var string $nodeSelected
 * @var array $params
 * @var array $iconsList
 * @var string $keyField
 * @var string $nodeView
 * @var string $isAdmin
 * @var string $noNodesMessage
 * @var boolean $softDelete
 * @var string $modelClass
 */
?>

<?
/* SECTION 1: Initialize node view params & setup helper methods. */

extract($params);
$session = Yii::$app->has('session') ? Yii::$app->session : null;

$checkBoxTemplate = ['template' => "{input}\n{label}"];

// parse parent key
if ($noNodesMessage) {
    $parentKey = '';
} elseif (empty($parentKey)) {
    $parent = $node->parents(1)->one();
    $parentKey = empty($parent) ? '' : Html::getAttributeValue($parent, $keyAttribute);
}

// tree manager module
$module = TreeView::module();

// active form instance
$form = ActiveForm::begin(['action' => $action, 'options' => $formOptions]);

// helper function to show alert
$showAlert = function ($type, $body = '', $hide = true) {
    $class = "alert alert-{$type}";
    if ($hide) {
        $class .= ' hide';
    }
    return Html::tag('div', '<div>' . $body . '</div>', ['class' => $class]);
};

// helper function to render additional view content
$renderContent = function ($part) use ($nodeAddlViews, $params, $form) {
    if (empty($nodeAddlViews[$part])) {
        return '';
    }
    $p = $params;
    $p['form'] = $form;
    return $this->render($nodeAddlViews[$part], $p);
};
?>

<? /* SECTION 2: Initialize hidden attributes. */ ?>
<?= Html::hiddenInput('treeNodeModify', $node->isNewRecord) ?>
<?= Html::hiddenInput('parentKey', $parentKey) ?>
<?= Html::hiddenInput('currUrl', $currUrl) ?>
<?= Html::hiddenInput('modelClass', $modelClass) ?>
<?= Html::hiddenInput('nodeSelected', $nodeSelected) ?>

<? /* SECTION 3: Hash signatures to prevent data tampering.*/ ?>

<?
$security = Yii::$app->security;
$id = $node->isNewRecord ? null : $node->$keyAttribute;

// save signature
$dataToHash = !!$node->isNewRecord . $currUrl . $modelClass;
echo Html::hiddenInput('treeSaveHash', $security->hashData($dataToHash, $module->treeEncryptSalt));

// manage signature
if (array_key_exists('depth', $breadcrumbs) && $breadcrumbs['depth'] === null) {
    $breadcrumbs['depth'] = '';
} elseif (!empty($breadcrumbs['depth'])) {
    $breadcrumbs['depth'] = (string)$breadcrumbs['depth'];
}
$icons = is_array($iconsList) ? array_values($iconsList) : $iconsList;
$dataToHash = $modelClass . !!$isAdmin . !!$softDelete . !!$showFormButtons . !!$showIDAttribute .
    !!$showNameAttribute . $currUrl . $nodeView . $nodeSelected . Json::encode($formOptions) .
    Json::encode($nodeAddlViews) . Json::encode($icons) . Json::encode($breadcrumbs);
echo Html::hiddenInput('treeManageHash', $security->hashData($dataToHash, $module->treeEncryptSalt));

// remove signature
$dataToHash = $modelClass . $softDelete;
echo Html::hiddenInput('treeRemoveHash', $security->hashData($dataToHash, $module->treeEncryptSalt));

// move signature
$dataToHash = $modelClass . $allowNewRoots;
echo Html::hiddenInput('treeMoveHash', $security->hashData($dataToHash, $module->treeEncryptSalt));
?>

<? /* BEGIN VALID NODE DISPLAY*/ ?>

<? if (!$noNodesMessage): ?>

    <?
    $isAdmin = ($isAdmin == true || $isAdmin === "true"); // admin mode flag
    $inputOpts = [];                                      // readonly/disabled input options for node
    $flagOptions = ['class' => 'kv-parent-flag'];         // node options for parent/child

    /**
     * initialize for create or update
     */
    $depth = ArrayHelper::getValue($breadcrumbs, 'depth');
    $glue = ArrayHelper::getValue($breadcrumbs, 'glue');
    $activeCss = ArrayHelper::getValue($breadcrumbs, 'activeCss');
    $untitled = ArrayHelper::getValue($breadcrumbs, 'untitled');
    $name = $node->getBreadcrumbs($depth, $glue, $activeCss, $untitled);
    if ($node->isNewRecord && !empty($parentKey) && $parentKey !== TreeView::ROOT_KEY) {
        /**
         * @var Tree $modelClass
         * @var Tree $parent
         */
        if (empty($depth)) {
            $depth = null;
        }
        if ($depth === null || $depth > 0) {
            $parent = $modelClass::findOne($parentKey);
            $name = $parent->getBreadcrumbs($depth, $glue, null) . $glue . $name;
        }
    }
    if ($node->isReadonly()) {
        $inputOpts['readonly'] = true;
    }
    if ($node->isDisabled()) {
        $inputOpts['disabled'] = true;
    }
    if ($node->isLeaf()) {
        $flagOptions['disabled'] = true;
    }

    $nameField = $showNameAttribute ? $form->field($node, $nameAttribute)->textInput($inputOpts) : '';
    ?>

    <? /* SECTION 4: Setup form action buttons. */ ?>
    <div class="kv-detail-heading">
        <? if (empty($inputOpts['disabled']) || ($isAdmin && $showFormButtons)): ?>
            <div class="pull-right">
                <? if ($node->depth != 0): ?>
                    <button type="button" data-src="<?= Url::to(['/pages/assets', 'pageID' => $node->$keyAttribute]) ?>" data-width="1280" data-height="900" data-fancybox="data-fancybox" class="btn btn-teal fancybox" title="<?= Yii::t('app', 'Pages-Assets') ?>">
                        <i class="glyphicon glyphicon-picture"></i>
                    </button>
                <? endif; ?>
                <button type="reset" class="btn btn-default" title="<?= Yii::t('app', 'Reset-Button') ?>">
                    <i class="glyphicon glyphicon-repeat"></i>
                </button>
                <button type="submit" class="btn btn-inverse" title="<?= Yii::t('app', 'Edit-Button') ?>">
                    <i class="glyphicon glyphicon-floppy-disk"></i>
                </button>
            </div>
        <? endif; ?>
        <div class="kv-detail-crumbs"><?= $name ?> (ID: <?= $node->$keyAttribute ?>)</div>
        <div class="clearfix"></div>
    </div>

    <? /* SECTION 5: Setup alert containers. Mandatory to set this up. */ ?>
    <div class="kv-treeview-alerts">
        <?
        if ($session && $session->hasFlash('success')) {
            echo $showAlert('success', $session->getFlash('success'), false);
        } else {
            echo $showAlert('success');
        }
        if ($session && $session->hasFlash('error')) {
            echo $showAlert('danger', $session->getFlash('error'), false);
        } else {
            echo $showAlert('danger');
        }
        echo $showAlert('warning');
        echo $showAlert('info');
        ?>
    </div>

    <? /* SECTION 6: Additional views part 1 - before all form attributes. */ ?>
    <?= $renderContent(Module::VIEW_PART_1); ?>

    <? /* SECTION 7: Basic node attributes for editing. */ ?>
    <div class="row">
        <div class="col-lg-6">
            <?= $nameField ?>
        </div>
        <div class="col-lg-6">
            <?= $form->field($node, 'title_en')->textInput($inputOpts); ?>
        </div>
        <div class="col-lg-6">
            <?= $form->field($node, 'url')->textInput($inputOpts); ?>
        </div>
        <div class="col-lg-12">
            <?= $form->field($node, 'content_az')->textarea($inputOpts); ?>
        </div>
        <div class="col-lg-12">
            <?= $form->field($node, 'content_en')->textarea($inputOpts); ?>
        </div>
        <?= Html::activeHiddenInput($node, $keyAttribute); ?>
    </div>

    <? /* SECTION 8: Additional views part 2 - before admin zone. */ ?>
    <?= $renderContent(Module::VIEW_PART_2) ?>

    <? /* SECTION 9: Administrator attributes zone. */ ?>

    <? if ($isAdmin): ?>
        <h4><?= Yii::t('app', 'Pages-Settings') ?></h4>
        <? /* SECTION 10: Additional views part 3 - within admin zone BEFORE mandatory attributes. */ ?>
        <?= $renderContent(Module::VIEW_PART_3) ?>

        <? /* SECTION 11: Default mandatory admin controlled attributes. */ ?>
        <div class="row">
            <div class="col-sm-3">
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'active', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'selected', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'collapsed', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'visible', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'readonly', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'disabled', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'removable', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'removable_all', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'movable_l', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'movable_r', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'movable_u', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'movable_d', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'show_az', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'show_en', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
                <div class="checkbox checkbox-success">
                    <?= $form->field($node, 'show_footer', $checkBoxTemplate)->checkbox(false, false) ?>
                </div>
            </div>
        </div>

        <? /* SECTION 12: Additional views part 4 - within admin zone AFTER mandatory attributes. */ ?>
        <?= $renderContent(Module::VIEW_PART_4) ?>

    <? endif; ?>

    <? /* SECTION 13: Additional views part 5 accessible by all users after admin zone. */ ?>
    <?= $renderContent(Module::VIEW_PART_5) ?>

<? else: ?>
    <?= $noNodesMessage ?>

<? endif; ?>

<? ActiveForm::end(); ?>