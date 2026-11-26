<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use admin\viewmodels\VideosViewModel;
use admin\helpers\HtmlHelper;

class VideosController extends MainController
{

    public $videosViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], VideosViewModel $videosViewModel)
    {
        $this->videosViewModel = $videosViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->videosViewModel;
        $model->tableData = $model->gridViewFilter();
        if ($model->tableData) {
            return $this->render('index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null)
    {
        $model = $this->videosViewModel;
        $model->formModel = $model->videosModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                return $this->redirect(['videos/index']);
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->videosViewModel->videosModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['videos/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->videosViewModel->videosModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['videos/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}