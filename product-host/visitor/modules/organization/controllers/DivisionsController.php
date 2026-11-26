<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\organization\controllers;

class DivisionsController extends BaseController
{

    public function actionIndex()
    {
        $model = $this->organizationViewModel;
        $model->records = $model->divisionsModel->getDivisions();
        if ($model->records) {
            return $this->render('/divisions/index', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }

}