<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use visitor\viewmodels\VideosViewModel;

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
        $model->tableData = $model->videosModel->getAllData();
        return $this->render('index', ['model' => $model]);
    }

}