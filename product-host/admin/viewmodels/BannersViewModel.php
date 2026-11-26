<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\Banners;

class BannersViewModel
{
    public $bannersModel;

    public function __construct(Banners $bannersModel)
    {
        $this->bannersModel = $bannersModel;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->bannersModel->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}