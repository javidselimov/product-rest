<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\organization\controllers;

class StaffController extends BaseController
{

    public function actionIndex(int $type)
    {
        $model = $this->organizationViewModel;
        $model->staffType = $type;
        $model->records = $model->staffModel->getStaffByType($type);
        if ($model->records) {
            return $this->render('/staff/index', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }

    public function actionDetail(int $id)
    {
        $model = $this->organizationViewModel;
        $data = $model->getRecordByID($model->staffModel, $id);
        if ($data) {
            return $this->render('/staff/detail', ['data' => $data]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }


}