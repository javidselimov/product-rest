<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace common\components\grid;

use yii;
use kartik\grid\GridView as KartikGridView;

class GridView extends KartikGridView
{
    /* Настройки GridView по умолчанию */
    public function init()
    {
        $this->resizableColumns = false;
        $this->export = false;
        $this->toolbar = false;
        $this->striped = false;
        $this->bordered = false;
        $this->tableOptions = ['class' => 'kartik-table'];
        $this->formatter = ['class' => 'yii\i18n\Formatter', 'nullDisplay' => Yii::t('model', 'Empty-Row')];
        $this->pjax = true;
        $this->pjaxSettings = [
            'options' => [
                'enablePushState' => false,
            ],
        ];
        $this->pager = [
            'firstPageLabel' => Yii::t('app', 'Pagination-FirstPage'),
            'lastPageLabel' => Yii::t('app', 'Pagination-LastPage'),
            'maxButtonCount' => 8,
        ];
        return parent::init();
    }

}