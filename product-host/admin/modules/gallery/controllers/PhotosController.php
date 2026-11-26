<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\gallery\controllers;

use Yii;
use admin\modules\gallery\viewmodels\GalleryViewModel;
use admin\helpers\HtmlHelper;

class PhotosController extends BaseController
{

    public $galleryViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], GalleryViewModel $galleryViewModel)
    {
        $this->galleryViewModel = $galleryViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $galleryID, int $id = null)
    {
        $this->layout = '@admin/views/layouts/popup';
        $model = $this->galleryViewModel;
        $model->formModel = $model->galleryImagesModel::loadModel($id, ['scenario' => 'add']);
        $model->tableData = $model->gridViewFilter($model->galleryImagesModel, ['gallery_id' => $galleryID]);
        $model->galleryID = $galleryID;
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            $model->formModel->gallery_id = $model->galleryID;
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save();
                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        }
        return $this->render('/photos/manage', ['model' => $model]);
    }

    public function actionDelete(int $galleryID, int $id)
    {
        $model = $this->galleryViewModel;
        $image = $model->galleryImagesModel::find()->where(['gallery_id' => $galleryID, 'id' => $id])->one();
        if (isset($image) and $image->delete()) {
            $this->redirect(['/gallery/photos', 'galleryID' => $galleryID]);
        } else {
            return $this->redirect(['home/index']);
        }
    }


}