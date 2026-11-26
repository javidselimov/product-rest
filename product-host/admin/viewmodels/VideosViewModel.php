<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use Yii;
use common\models\Videos;

class VideosViewModel
{
    public $videosModel;

    public $formModel;
    public $tableData;

    public function __construct(Videos $videosModel)
    {
        $this->videosModel = $videosModel;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->videosModel->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}