<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\meas\viewmodels;

use common\models\MainModel;
use common\models\Meas;
use common\models\MeasEmitent;
use common\models\MeasInfoType;

class MeasViewModel
{
    public $measModel;
    public $measEmitentModel;
    public $measInfoTypeModel;

    public function __construct(Meas $measModel, MeasEmitent $measEmitent, MeasInfoType $measInfoType)
    {
        $this->measModel = $measModel;
        $this->measEmitentModel = $measEmitent;
        $this->measInfoTypeModel = $measInfoType;
    }

    public function gridView(MainModel $model, string $defaultOrderField)
    {
        $dataProvider = $model->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => [$defaultOrderField => SORT_ASC]];
        return $dataProvider;
    }

}