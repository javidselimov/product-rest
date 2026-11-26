<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\laws\controllers;

use Yii;
use admin\controllers\MainController;
use admin\helpers\HtmlHelper;
use admin\modules\laws\viewmodels\LawsViewModel;

class CategoriesController extends MainController
{

    public $lawsViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], LawsViewModel $lawsViewModel)
    {
        $this->lawsViewModel = $lawsViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->lawsViewModel;
        $model->tableData = $model->categoriesGridView($model->lawsCategoriesModel);
        $model->tableData->sort = ['defaultOrder' => ['id' => SORT_ASC]];
        if ($model->tableData) {
            return $this->render('/categories/index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null)
    {
        $model = $this->lawsViewModel;
        $model->formModel = $model->lawsCategoriesModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                return $this->redirect(['categories/index']);
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('/categories/manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->lawsViewModel->lawsCategoriesModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['categories/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->lawsViewModel->lawsCategoriesModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['categories/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}