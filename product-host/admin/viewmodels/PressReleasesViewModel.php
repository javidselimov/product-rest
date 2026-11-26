<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use Yii;
use common\models\PressReleases;
use common\models\PressReleasesAssets;

class PressReleasesViewModel
{

    public $pressReleasesModel;
    public $pressReleasesAssetsModel;

    public $type;
    public $formModel;
    public $tableData;
    public $assetsPageID;
    public $assetsFormModel;
    public $assetsTableData;

    public function __construct()
    {
        //TODO refactor DI
        $this->pressReleasesModel = new PressReleases(['scenario' => 'view']);
        $this->pressReleasesAssetsModel = new PressReleasesAssets(['scenario' => 'view']);
    }

    public function gridViewFilter(array $condition = [])
    {
        $dataProvider = $this->pressReleasesModel->loadDataProvider($condition);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['date' => SORT_DESC]];
        //Данные для фильтрации
        $dataProvider->query->andFilterWhere(['like', 'title_az', $this->pressReleasesModel->title_az]);
        $dataProvider->query->andFilterWhere(['=', 'type', $this->pressReleasesModel->type]);
        return $dataProvider;
    }

    public function assetsGridViewFilter(array $condition = [])
    {
        $dataProvider = $this->pressReleasesAssetsModel->loadDataProvider($condition);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}