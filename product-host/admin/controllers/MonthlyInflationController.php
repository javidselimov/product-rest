<?
/*
 * Developed by Junie
*/

namespace admin\controllers;

use Yii;
use admin\viewmodels\MonthlyInflationViewModel;
use admin\helpers\HtmlHelper;

class MonthlyInflationController extends MainController
{
    public $monthlyInflationViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], MonthlyInflationViewModel $monthlyInflationViewModel)
    {
        $this->monthlyInflationViewModel = $monthlyInflationViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        return $this->redirect(['monthly-inflation/manage']);
    }

    public function actionManage()
    {
        $model = $this->monthlyInflationViewModel->monthlyInflationModel::loadModel(1, ['scenario' => 'add']);
        
        if (!$model) {
            $model = $this->monthlyInflationViewModel->monthlyInflationModel::loadModel(null, ['scenario' => 'add']);
            $model->id = 1;
        }
        
        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
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
}
