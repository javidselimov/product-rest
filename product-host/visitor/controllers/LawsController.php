<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use yii\data\ActiveDataProvider;
use visitor\viewmodels\LawsViewModel;

class LawsController extends MainController
{

    public $lawsViewModel;

    public function __construct($id, \yii\base\Module $module, LawsViewModel $lawsViewModel, array $config = [])
    {
        $this->lawsViewModel = $lawsViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $model = $this->lawsViewModel;
        $formModel = $model->formModel;

        if (Yii::$app->request->get()) {
            $formModel->load(Yii::$app->request->get());
            if (!$formModel->validate()) {
                return $this->redirect(['/laws/index']);
            }
        }

        $query = $model->getLawsData($formModel);
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => ['defaultOrder' => ['title_' . Yii::$app->language => SORT_ASC]],
            'pagination' => [
                'pageSize' => 8,
            ],
        ]);
        return $this->render('index', ['formModel' => $formModel, 'dataProvider' => $dataProvider]);
    }

    public function actionDetail(int $id)
    {
        $model = $this->lawsViewModel;
        $model->law = $model->lawsModel::findOne($id);
        if ($model->law) {
            return $this->render('detail', ['model' => $model]);
        }
        return $this->redirect(['home/index']);
    }


}