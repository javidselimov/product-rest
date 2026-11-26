<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\organization\controllers;

class OfficesController extends BaseController
{

    public function actionIndex()
    {
        $model = $this->organizationViewModel;
        $model->records = $model->officesModel->getOffices();
        if ($model->records) {
            return $this->render('/offices/index', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }

}