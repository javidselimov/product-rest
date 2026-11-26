<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use admin\helpers\HtmlHelper;
use admin\viewmodels\CurrencyRatesViewModel;

class CurrencyController extends MainController
{

    public $currencyRatesViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], CurrencyRatesViewModel $currencyRatesViewModel)
    {
        $this->currencyRatesViewModel = $currencyRatesViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionRates()
    {
        $dataProvider = $this->currencyRatesViewModel->gridViewFilter();
        $searchModel = $this->currencyRatesViewModel->currencyRatesModel;
        $searchModel->setScenario('view');
        return $this->render('index', ['dataProvider' => $dataProvider, 'searchModel' => $searchModel]);
    }

    public function actionAdd()
    {
        $model = $this->currencyRatesViewModel->currencyRatesModel;
        $model->setScenario('add');
        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->validate()) {
                $model->save();
                return $this->redirect(['currency/rates']);
            } else {
                $errors = current($model->errors);
                $model->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model)) {
            return $this->redirect(['index']);
        }
        return $this->render('add', ['model' => $model]);
    }

    public function actionEdit(int $id)
    {
        $model = $this->currencyRatesViewModel->currencyRatesModel::loadModel($id);
        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->validate()) {
                $model->save();
                $model->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->errors);
                $model->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model)) {
            return $this->redirect(['index']);
        }
        return $this->render('edit', ['model' => $model]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->currencyRatesViewModel->currencyRatesModel::loadModel($id);
        if ($model->changeRowStatus()) {
            return $this->redirect(['currency/rates']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

    public function actionDelete(int $id)
    {
        $model = $this->currencyRatesViewModel->currencyRatesModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['currency/rates']);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}