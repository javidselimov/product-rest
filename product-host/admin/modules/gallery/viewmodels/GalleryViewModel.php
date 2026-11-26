<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\modules\gallery\viewmodels;

use common\models\MainModel;
use common\models\Gallery;
use common\models\GalleryImages;

class GalleryViewModel
{
    public $galleryModel;
    public $galleryImagesModel;

    public $galleryID;
    public $formModel;
    public $tableData;

    public function __construct(Gallery $galleryModel, GalleryImages $galleryImagesModel)
    {
        $this->galleryModel = $galleryModel;
        $this->galleryImagesModel = $galleryImagesModel;
    }

    public function gridViewFilter(MainModel $model, array $params = [])
    {
        $dataProvider = $model->loadDataProvider($params);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}