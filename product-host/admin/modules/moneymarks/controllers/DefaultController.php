<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\moneymarks\controllers;

use Yii;
use admin\modules\moneymarks\viewmodels\MoneyMarksViewModel;
use admin\helpers\HtmlHelper;

class DefaultController extends BaseController
{

    public $moneyMarksViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], MoneyMarksViewModel $moneyMarksViewModel)
    {
        $this->moneyMarksViewModel = $moneyMarksViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $category, int $type)
    {
        $model = $this->moneyMarksViewModel;
        $model->tableData = $model->gridViewFilter($model->moneyMarksModel, ['category_id' => $category, 'type' => $type]);
        if ($model->tableData and $type <= 2) {
            $model->category = $category;
            $model->type = $type;
            return $this->render('/default/index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null, int $category, int $type)
    {
        $model = $this->moneyMarksViewModel;
        $model->formModel = $model->moneyMarksModel::loadModel($id, ['scenario' => 'add']);
        $model->category = $category;
        $model->type = $type;
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            $model->formModel->category_id = $model->category;
            $model->formModel->type = $model->type;
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
        $model = $this->moneyMarksViewModel->moneyMarksModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['default/index', 'category' => $model['category_id'], 'type' => $model['type']]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->moneyMarksViewModel->moneyMarksModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['default/index', 'category' => $model['category_id'], 'type' => $model['type']]);
        } else {
            return $this->redirect(['home/index']);
        }
    }


}