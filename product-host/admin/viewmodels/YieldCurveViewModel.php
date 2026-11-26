<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\YCYields;
use common\models\YieldCurve;
use Yii;

class YieldCurveViewModel
{

    public $usersModel;
    public $formModel;
    public $tableData;

    public function __construct(YCYields $usersModel)
    {
        $this->usersModel = $usersModel;
    }

    public function gridViewFilter(array $condition = [])
    {
        $dataProvider = $this->usersModel->loadDataProvider($condition);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['id' => SORT_DESC]];
        return $dataProvider;
    }

    /* @return \common\models\Users */
    public function getCurrentUserData()
    {
        $currentUserID = Yii::$app->user->identity->getId();
        return $this->usersModel::loadModel($currentUserID);
    }


}

