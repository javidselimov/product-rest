<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\organization\viewmodels;

use common\models\MainModel;
use common\models\OrganizationStaff;
use common\models\OrganizationOffices;
use common\models\OrganizationDivisions;

class OrganizationViewModel
{

    public $staffModel;
    public $officesModel;
    public $divisionsModel;

    public $staffType;
    public $formModel;
    public $tableData;

    public function __construct(OrganizationStaff $staffModel, OrganizationOffices $officesModel, OrganizationDivisions $divisionsModel)
    {
        $this->staffModel = $staffModel;
        $this->officesModel = $officesModel;
        $this->divisionsModel = $divisionsModel;
    }

    public function gridViewFilter(MainModel $model, array $params = [])
    {
        $dataProvider = $model->loadDataProvider($params);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}