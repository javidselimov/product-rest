<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use common\models\Laws;
use common\models\LawsCategories;
use visitor\models\LawsForm;

class LawsViewModel
{

    public $lawsModel;
    public $lawsCategoriesModel;

    public $law;
    public $formModel;

    public function __construct(Laws $lawsModel, LawsCategories $lawsCategories, LawsForm $lawsForm)
    {
        $this->lawsModel = $lawsModel;
        $this->lawsCategoriesModel = $lawsCategories;
        $this->formModel = $lawsForm;
    }

    public function getLawsData(LawsForm $formModel)
    {
        $query = $this->lawsModel::find()->with(['category']);
        if ($formModel->searchType == 1) {
            $query->andFilterWhere(['ILIKE', 'title_az', $formModel->keyword]);
            $query->orFilterWhere(['ILIKE', 'title_en', $formModel->keyword]);
        } elseif ($formModel->searchType == 2) {
            $query->andFilterWhere(['ILIKE', 'description_az', $formModel->keyword]);
            $query->orFilterWhere(['ILIKE', 'description_en', $formModel->keyword]);
        }
        $query->andFilterWhere(['type' => $formModel->type]);
        return $query;
    }
}