<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use admin\helpers\HtmlHelper;
use admin\viewmodels\PagesViewModel;

class PagesController extends MainController
{

    public $pagesViewModel;

    public function __construct(string $id, \yii\base\Module $module, array $config = [], PagesViewModel $pagesViewModel)
    {
        $this->pagesViewModel = $pagesViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionAssets(int $pageID, int $id = null)
    {
        $this->layout = '@admin/views/layouts/popup';
        $model = $this->pagesViewModel;
        $model->assetsFormModel = $model->pagesAssetsModel::loadModel($id, ['scenario' => 'add']);
        $model->assetsTableData = $model->gridViewFilter(['page_id' => $pageID]);
        $model->pageID = $pageID;
        if (Yii::$app->request->post()) {
            $model->assetsFormModel->load(Yii::$app->request->post());
            $model->assetsFormModel->page_id = $pageID;
            /* Валидация формы */
            if ($model->assetsFormModel->validate()) {
                $model->assetsFormModel->save();
                $model->assetsFormModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->assetsFormModel->errors);
                $model->assetsFormModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        }
        return $this->render('assets', ['model' => $model]);
    }

    public function actionDeleteAsset(int $pageID, int $id = null)
    {
        $model = $this->pagesViewModel;
        $asset = $model->pagesAssetsModel::find()->where(['page_id' => $pageID, 'id' => $id])->one();
        if (isset($asset) and $asset->delete()) {
            $this->redirect(['pages/assets', 'pageID' => $pageID]);
        } else {
            return $this->redirect(['home/index']);
        }
    }


}