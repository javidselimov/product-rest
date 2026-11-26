<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\meas\controllers;

use Yii;
use admin\helpers\HtmlHelper;
use admin\modules\meas\viewmodels\MeasViewModel;

class DefaultController extends BaseController
{

    public $measViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], MeasViewModel $measViewModel)
    {
        $this->measViewModel = $measViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->measViewModel;
        $dataProvider = $model->gridView($model->measModel, 'emitent_id');
        return $this->render('/meas/index', ['dataProvider' => $dataProvider]);
    }

    public function actionManage(int $id = null)
    {
        $model = $this->measViewModel;
        $formModel = $this->measViewModel->measModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($formModel->validate()) {
                $formModel->save();
                $formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($formModel->errors);
                $formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('/meas/manage', ['model' => $model, 'formModel' => $formModel]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->measViewModel->measModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['meas/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->measViewModel->measModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['meas/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}