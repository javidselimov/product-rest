<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\organization\viewmodels;

use common\models\MainModel;
use admin\modules\organization\viewmodels\OrganizationViewModel as MainOrganizationViewModel;


class OrganizationViewModel extends MainOrganizationViewModel
{

    public function getRecordByID(MainModel $model, int $id)
    {
        return $model::find()->where(['id' => $id, 'active' => '1'])->one();
    }
}