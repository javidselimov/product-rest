<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\organization\controllers;

use Yii;
use admin\helpers\HtmlHelper;
use admin\modules\organization\viewmodels\OrganizationViewModel;

class StaffController extends BaseController
{

    public $organizationViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], OrganizationViewModel $organizationViewModel)
    {
        $this->organizationViewModel = $organizationViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $type)
    {
        $model = $this->organizationViewModel;
        $model->tableData = $model->gridViewFilter($model->staffModel, ['type' => $type]);
        $model->staffType = $type;
        if ($model->tableData) {
            return $this->render('/staff/index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $type, int $id = null)
    {
        $model = $this->organizationViewModel;
        $model->staffType = $type;
        $model->formModel = $model->staffModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            $model->formModel->type = $model->staffType;
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
        return $this->render('/staff/manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionChangeStatus(int $type, int $id)
    {
        $model = $this->organizationViewModel->staffModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['staff/index', 'type' => $type]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->organizationViewModel->staffModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['staff/index', 'type' => $model['type']]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}