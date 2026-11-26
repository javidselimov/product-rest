<?

/*
 * Developed by Junie
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\NewsSlider;

class NewsSliderViewModel
{
    public $newsSliderModel;

    public function __construct(NewsSlider $newsSliderModel)
    {
        $this->newsSliderModel = $newsSliderModel;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->newsSliderModel->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['ordering' => SORT_ASC]];
        return $dataProvider;
    }

}
