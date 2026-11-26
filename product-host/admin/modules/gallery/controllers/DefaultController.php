<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\gallery\controllers;

use Yii;
use admin\modules\gallery\viewmodels\GalleryViewModel;
use admin\helpers\HtmlHelper;

class DefaultController extends BaseController
{

    public $galleryViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], GalleryViewModel $galleryViewModel)
    {
        $this->galleryViewModel = $galleryViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->galleryViewModel;
        $model->tableData = $model->gridViewFilter($model->galleryModel);
        if ($model->tableData) {
            return $this->render('/gallery/index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionManage(int $id = null)
    {
        $model = $this->galleryViewModel;
        $model->formModel = $model->galleryModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                return $this->redirect(['default/index']);
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('/gallery/manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->galleryViewModel->galleryModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['default/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->galleryViewModel->galleryModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['default/index']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}