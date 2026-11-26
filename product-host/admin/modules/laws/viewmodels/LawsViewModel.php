<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\laws\viewmodels;

use common\models\MainModel;
use common\models\LawsCategories;
use common\models\Laws;

class LawsViewModel
{

    public $lawsCategoriesModel;
    public $lawsModel;

    public $formModel;
    public $tableData;
    public $category;

    public function __construct(LawsCategories $lawsCategories, Laws $lawsModel)
    {
        $this->lawsCategoriesModel = $lawsCategories;
        $this->lawsModel = $lawsModel;
    }

    public function categoriesGridView(MainModel $model, array $params = [])
    {
        $dataProvider = $model->loadDataProvider($params);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['id' => SORT_ASC]];
        return $dataProvider;
    }

    public function lawsGridView(MainModel $model, array $params = [])
    {
        $dataProvider = $model->loadDataProvider($params);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['id' => SORT_ASC]];
        //Данные для фильтрации
        if ($this->lawsModel->validate()) {
            $dataProvider->query->andFilterWhere(['like', 'title_az', $model->title_az]);
            $dataProvider->query->andFilterWhere(['=', 'type', $model->type]);
            $dataProvider->query->andFilterWhere(['=', 'active', $model->active]);
        }
        return $dataProvider;
    }

    public function getLawsGategory(int $category)
    {
        return LawsCategories::findOne($category);
    }

}