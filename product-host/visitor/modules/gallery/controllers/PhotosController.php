<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\gallery\controllers;

use visitor\modules\gallery\viewmodels\GalleryViewModel;

class PhotosController extends BaseController
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
        $model->tableData = $model->galleryModel->getAllData();
        return $this->render('index', ['model' => $model]);
    }

    public function actionDetail(int $id)
    {
        $model = $this->galleryViewModel;
        $model->selectedGallery = $model->galleryModel->getRecordByID($id);
        if ($model->selectedGallery) {
            return $this->render('detail', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }


}