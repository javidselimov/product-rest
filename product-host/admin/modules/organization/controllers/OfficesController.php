<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\organization\controllers;

use Yii;
use admin\helpers\HtmlHelper;
use admin\modules\organization\viewmodels\OrganizationViewModel;

class OfficesController extends BaseController
{

    public $organizationViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], OrganizationViewModel $organizationViewModel)
    {
        $this->organizationViewModel = $organizationViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->organizationViewModel;
        $model->tableData = $model->gridViewFilter($model->officesModel);
        if ($model->tableData) {
            return $this->render('/offices/index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null)
    {
        $model = $this->organizationViewModel;
        $model->formModel = $model->officesModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
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
        return $this->render('/offices/manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->organizationViewModel->officesModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['offices/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->organizationViewModel->officesModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['offices/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}