<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\Azir;
use Yii;
use common\models\Users;
use common\models\PressRelizQuestion;

class PressRelizQuestionModule
{

    public $usersModel;
    public $formModel;
    public $tableData;
    public $pressReleasesQuestionModel;

    public function __construct()
    {

        $this->pressReleasesQuestionModel = new PressRelizQuestion(['scenario' => 'view']);

        $this->usersModel = new PressRelizQuestion();
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

