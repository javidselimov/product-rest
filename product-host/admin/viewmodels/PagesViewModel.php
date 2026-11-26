<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use admin\models\Pages;
use common\models\PagesAssets;

class PagesViewModel
{

    public $pagesModel;
    public $pagesAssetsModel;

    public $pageID;
    public $assetsFormModel;
    public $assetsTableData;

    public function __construct(Pages $pagesModel, PagesAssets $pagesAssetsModel)
    {
        $this->pagesModel = $pagesModel;
        $this->pagesAssetsModel = $pagesAssetsModel;
    }

    public function gridViewFilter(array $condition = [])
    {
        $dataProvider = $this->pagesAssetsModel->loadDataProvider($condition);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}