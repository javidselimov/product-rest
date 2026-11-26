<?

/*
 * Developed by Urmuz Tagizade
*/

namespace admin\controllers;

use Yii;
use admin\viewmodels\VideosStreamsViewModel;
use admin\helpers\HtmlHelper;

class VideosStreamsController extends MainController
{

    public $videosStreamsViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], VideosStreamsViewModel $videosStreamsViewModel)
    {
        $this->videosStreamsViewModel = $videosStreamsViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->videosStreamsViewModel;
        $model->tableData = $model->gridViewFilter();
        if ($model->tableData) {
            return $this->render('index', ['model' => $model]);
        }

        return $this->redirect(['home/index']);
    }

    public function actionManage(int $id = null)
    {
        $model = $this->videosStreamsViewModel;
        $model->formModel = $model->videosStreamsModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();

                return $this->redirect(['videos-streams/index']);
            }
            $errors = current($model->formModel->errors);
            $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }

        return $this->render('manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->videosStreamsViewModel->videosStreamsModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['videos-streams/index']);
        }

        return $this->redirect(['home/index']);
    }

    public function actionDelete(int $id)
    {
        $model = $this->videosStreamsViewModel->videosStreamsModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['videos-streams/index']);
        }
        return $this->redirect(['home/index']);
    }

}