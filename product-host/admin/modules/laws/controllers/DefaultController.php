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

class DefaultController extends MainController
{

    public $lawsViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], LawsViewModel $lawsViewModel)
    {
        $this->lawsViewModel = $lawsViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $category)
    {
        $model = $this->lawsViewModel;
        $model->lawsModel->setScenario('view');
        $model->tableData = $model->lawsGridView($model->lawsModel, ['category_id' => $category]);
        if ($model->tableData) {
            $model->category = $model->getLawsGategory($category);
            return $this->render('/default/index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null, int $category)
    {
        $model = $this->lawsViewModel;
        $model->formModel = $model->lawsModel::loadModel($id, ['scenario' => 'add']);
        $model->category = $category;
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            $model->formModel->category_id = $model->category;
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('/default/manage', ['model' => $model, 'formModel' => $model->formModel]);
    }


    public function actionChangeStatus(int $id)
    {
        $model = $this->lawsViewModel->lawsModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['default/index', 'category' => $model['category_id']]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->lawsViewModel->lawsModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['default/index', 'category' => $model['category_id']]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}