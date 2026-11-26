<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\moneymarks\controllers;

class NewsController extends BaseController
{

    public function actionIndex(int $category = null)
    {
        $model = $this->moneyMarksViewModel;
        $model->tableData = $model->moneyMarksNewsModel->getAllData();
        return $this->render('index', ['model' => $model]);
    }

    public function actionDetail(int $id)
    {
        $model = $this->moneyMarksViewModel;
        $model->detailData = $model->moneyMarksNewsModel::findOne($id);
        if ($model->detailData) {
            return $this->render('detail', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }

    }
}