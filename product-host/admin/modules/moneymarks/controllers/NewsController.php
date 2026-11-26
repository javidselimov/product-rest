<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\moneymarks\controllers;

use Yii;
use admin\modules\moneymarks\viewmodels\MoneyMarksViewModel;
use admin\helpers\HtmlHelper;

class NewsController extends BaseController
{

    public $moneyMarksViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], MoneyMarksViewModel $moneyMarksViewModel)
    {
        $this->moneyMarksViewModel = $moneyMarksViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->moneyMarksViewModel;
        $model->tableData = $model->gridViewFilter($model->moneyMarksNewsModel);
        $model->tableData->sort = ['defaultOrder' => ['date' => SORT_DESC]];
        if ($model->tableData) {
            return $this->render('index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null)
    {
        $model = $this->moneyMarksViewModel;
        $model->formModel = $model->moneyMarksNewsModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                return $this->redirect(['news/index']);
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('manage', ['model' => $model]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->moneyMarksViewModel->moneyMarksNewsModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['news/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->moneyMarksViewModel->moneyMarksNewsModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['news/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}