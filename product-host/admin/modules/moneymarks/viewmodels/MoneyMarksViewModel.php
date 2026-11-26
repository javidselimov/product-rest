<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\moneymarks\viewmodels;

use common\models\MainModel;
use common\models\MoneyMarksCategories;
use common\models\MoneyMarks;
use common\models\MoneyMarksNews;

class MoneyMarksViewModel
{

    const BANKNOTES_TYPE = 1;
    const COINS_TYPE = 2;

    public $moneyMarksCategoriesModel;
    public $moneyMarksModel;
    public $moneyMarksNewsModel;

    public $formModel;
    public $tableData;
    public $detailData;
    public $category;
    public $type;

    public function __construct(MoneyMarksCategories $moneyMarksCategoriesModel, MoneyMarks $moneyMarksModel, MoneyMarksNews $moneyMarksNewsModel)
    {
        $this->moneyMarksCategoriesModel = $moneyMarksCategoriesModel;
        $this->moneyMarksModel = $moneyMarksModel;
        $this->moneyMarksNewsModel = $moneyMarksNewsModel;
    }

    public
    function gridViewFilter(MainModel $model, array $params = [])
    {
        $dataProvider = $model->loadDataProvider($params);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}