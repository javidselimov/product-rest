<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use admin\viewmodels\RunningLineViewModel;
use admin\helpers\HtmlHelper;

class RunningLineController extends MainController
{
    public $runningLineViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], RunningLineViewModel $runningLineViewModel)
    {
        $this->runningLineViewModel = $runningLineViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        // Since we only have one record, redirect directly to the manage action
        return $this->redirect(['running-line/manage', 'id' => 1]);
    }

    public function actionManage()
    {
        // Always load the record with id=1
        $model = $this->runningLineViewModel->runningLineModel::loadModel(1, ['scenario' => 'add']);
        
        // If the record doesn't exist, create it
        if (!$model) {
            $model = $this->runningLineViewModel->runningLineModel::loadModel(null, ['scenario' => 'add']);
            $model->id = 1;
        }
        
        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
            /* Validate the form */
            if ($model->validate()) {
                $model->save();
                $model->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->errors);
                $model->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        }
        
        return $this->render('manage', ['model' => $model]);
    }

    public function actionChangeStatus()
    {
        $model = $this->runningLineViewModel->runningLineModel::loadModel(1);
        if ($model) {
            $model->activity = !$model->activity;
            if ($model->save()) {
                return $this->redirect(['running-line/manage']);
            }
        }
        return $this->redirect(['home/index']);
    }
}