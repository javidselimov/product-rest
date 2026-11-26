<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use yii\data\ActiveDataProvider;
use visitor\viewmodels\MeasViewModel;

class MeasController extends MainController
{

    public $measViewModel;

    public function __construct($id, \yii\base\Module $module, MeasViewModel $measViewModel, array $config = [])
    {
        $this->measViewModel = $measViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->measViewModel;
        $formModel = $model->formModel;

        if (Yii::$app->request->get()) {
            $formModel->load(Yii::$app->request->get());
            if (!$formModel->validate()) {
                return $this->redirect(['/meas/index']);
            }
        }

        $query = $model->getMeasData($formModel);

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => 8,
            ],
        ]);

        return $this->render('index', ['model' => $model, 'formModel' => $formModel, 'dataProvider' => $dataProvider]);
    }

}