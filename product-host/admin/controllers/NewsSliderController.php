<?

/*
 * Developed by Junie
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use admin\viewmodels\NewsSliderViewModel;
use admin\helpers\HtmlHelper;

class NewsSliderController extends MainController
{

    public $newsSliderViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], NewsSliderViewModel $newsSliderViewModel)
    {
        $this->newsSliderViewModel = $newsSliderViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $dataProvider = $this->newsSliderViewModel->gridViewFilter();
        return $this->render('index', ['dataProvider' => $dataProvider]);
    }

    public function actionManage(int $id = null)
    {
        $model = $this->newsSliderViewModel->newsSliderModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->validate()) {
                $model->save();
                $model->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->errors);
                $model->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('manage', ['model' => $model]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->newsSliderViewModel->newsSliderModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['news-slider/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->newsSliderViewModel->newsSliderModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['news-slider/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}
