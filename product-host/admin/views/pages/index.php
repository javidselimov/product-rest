<?

use admin\models\Pages;
use common\components\treeview\TreeView;
use admin\assets\TextEditorAsset;
use admin\assets\FancyboxAsset;

TextEditorAsset::register($this);
FancyboxAsset::register($this);

$this->title = Yii::t('app', 'Pages');
$this->params['breadcrumbs'][] = $this->title;

echo TreeView::widget([
    'query' => Pages::find()->addOrderBy('parent_id, left_position'),
    'rootOptions' => ['label' => $this->title],
    'mainTemplate' => '
     <div class="row">
        <div class="col-lg-4 col-md-4 col-sm-4">
            {wrapper}
        </div>
        <div class="col-lg-8 col-md-8 col-sm-8">
            {detail}
        </div>
    </div>',
]);
?>