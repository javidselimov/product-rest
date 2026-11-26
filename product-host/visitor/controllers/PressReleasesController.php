<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use common\models\PressReleases;
use common\models\PressRelizQuestion;
use common\models\PressRelizQuestionValue;
use Yii;
use visitor\viewmodels\PressReleasesViewModel;
use yii\data\ActiveDataProvider;


use yii\web\Cookie;

class PressReleasesController extends MainController
{
    public $pressReleasesViewModel;

    public function __construct($id, \yii\base\Module $module, PressReleasesViewModel $pressReleasesViewModel, array $config = [])
    {
        $this->pressReleasesViewModel = $pressReleasesViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $type = 1, string $dateFrom = null, string $dateTo = null)
    {
        $model = $this->pressReleasesViewModel;

        if (Yii::$app->request->get()) {
            $model->formModel->load(Yii::$app->request->get());
            if ($model->formModel->validate()) {
                $model->type = $type;
                $query = $model->getPressReleases($type, $dateFrom, $dateTo);

                $dataProvider = new ActiveDataProvider([
                    'query' => $query,
                    'pagination' => [
                        'pageSize' => 8,
                    ],
                ]);

                return $this->render('index', ['model' => $model, 'dataProvider' => $dataProvider]);
            }
        }
        return $this->redirect(['home/index']);
    }

    public function actionPass($id){





        if(Yii::$app->request->cookies->getValue('question-'.$id)==0){
            $deyer=new PressRelizQuestionValue();
            $deyer->press_reliz_id=$id;
            $deyer->val=Yii::$app->request->get()['value'];
            $deyer->note=Yii::$app->request->get()['note'];
            $deyer->save();


            $cookie = new Cookie([
                'name' => 'question-'.$id,
                'value' => 1,
            ]);

            Yii::$app->response->cookies->add($cookie);

            $cookieValue = Yii::t('other','Sorğuda iştirakınız üçün təşəkkür edirik!');

            Yii::$app->session->setFlash('message-'.$id, $cookieValue);

        }










        return Yii::$app->getResponse()->redirect(Yii::$app->getRequest()->referrer);




    }
    public function actionDetail(int $id)
    {

        try{
            $search_questions=PressRelizQuestion::find()->where(['press_reliz_id'=>$id])->all();

            foreach ($search_questions as $search_question){
                $search_question->visit+=1;
                $search_question->save();
            }
        }catch(\Exception $e){

        }

        $model = $this->pressReleasesViewModel;
        $model->pressRelease = $model->pressReleasesModel::findOne($id);
        $model->pressReleaseAssets = $model->pressRelease->pressReleasesAssets;
        return $this->render('detail', ['model' => $model,'search_questions'=>$search_questions]);

    }

}
