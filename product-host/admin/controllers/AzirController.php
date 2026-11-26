<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use admin\viewmodels\AzirViewModel;
use common\components\filesystem\SFTP;
use common\models\Azir;
use Yii;
use admin\viewmodels\BannersViewModel;
use admin\helpers\HtmlHelper;
use yii\web\UploadedFile;

class AzirController extends MainController
{

    public $azirViewModel;

    public function __construct(string $id, \yii\base\Module $module, array $config = [], AzirViewModel $usersViewModel)
    {
        $this->azirViewModel = $usersViewModel;
        parent::__construct($id, $module, $config);
    }
    public function actionIndex()
    {

        $model = $this->azirViewModel;

        $model->tableData = $model->gridViewFilter();


        try{
            return $this->render('index', ['model' => $model]);

        }catch(\Exception $e){
            echo $e->getMessage();
        }    }



    public function actionCreate(int $id=null){




        try{
            $model = $this->azirViewModel;

            $model->formModel = $model->usersModel::loadModel($id);

            if (Yii::$app->request->post()) {
                $model->formModel->load(Yii::$app->request->post());
                /* Валидация формы */
                $title_az = Yii::$app->request->post()['Azir']['title_az'];
                $title_en = Yii::$app->request->post()['Azir']['title_en'];
                $faiz_az = Yii::$app->request->post()['Azir']['faiz_az'];
                $faiz_en = Yii::$app->request->post()['Azir']['faiz_en'];
                $eqd_hecm_az = Yii::$app->request->post()['Azir']['eqd_hecm_az'];
                $eqd_hecm_en = Yii::$app->request->post()['Azir']['eqd_hecm_en'];
                $eqd_say_az = Yii::$app->request->post()['Azir']['eqd_say_az'];
                $eqd_say_en = Yii::$app->request->post()['Azir']['eqd_say_en'];
                $order_column = Yii::$app->request->post()['Azir']['order_column'];
                $date = Yii::$app->request->post()['Azir']['date'];
                $home_view=  Yii::$app->request->post()['home_view'] ?? 0;
                $date_view=  Yii::$app->request->post()['date_view'] ?? 0;

                $eqd_hecm_usd = Yii::$app->request->post()['Azir']['eqd_hecm_usd'];

                if($date_view==1){
                    $connection = Yii::$app->db;
                    $command = $connection->createCommand("UPDATE azir_indexses set date_view=null");
                    $result = $command->execute();
                }
                if($id==null){

                    if ($model->formModel->validate()) {



                        $connection = Yii::$app->db;
                        $command = $connection->createCommand("INSERT INTO azir_indexses (title_az, title_en, faiz_az, faiz_en, eqd_hecm_az, eqd_hecm_en, eqd_hecm_usd, eqd_say_az, eqd_say_en, date, home_view, date_view, order_column)
VALUES ('".$title_az."', '".$title_en."', '".$faiz_az."', '".$faiz_en."', '".$eqd_hecm_az."', '".$eqd_hecm_en."', '".$eqd_say_az."', '".$eqd_say_en."','".$eqd_hecm_usd."', '".$date."', '".$home_view."', '".$date_view."', '".$order_column."');
");
                        $result = $command->execute();

                        $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
                    } else {
                        $errors = current($model->formModel->errors);
                        $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
                    }
                }
                else{


                    $connection = Yii::$app->db;
                    $command = $connection->createCommand("UPDATE azir_indexses
 set title_az='".$title_az."', title_en= '".$title_en."', faiz_az='".$faiz_az."', faiz_en='".$faiz_en."', eqd_hecm_az='".$eqd_hecm_az."', eqd_hecm_en='".$eqd_hecm_en."',eqd_hecm_usd='".$eqd_hecm_usd."', eqd_say_az='".$eqd_say_az."', eqd_say_en='".$eqd_say_en."' , date='".$date."', home_view='".$home_view."', date_view='".$date_view."', order_column='".$order_column."' where id=".$id);
                    $result = $command->execute();

                    $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');


                }


            }

            return $this->render('manage', ['model' => $model]);
        }catch (\Exception $e){
            echo $e->getMessage();
            exit;
        }


    }

    public function actionClean(){
        $connection = Yii::$app->db;
        $command = $connection->createCommand("UPDATE azir_indexses set home_view=null");
        $result = $command->execute();
        return $this->redirect(['azir/index']);
    }
    public function actionAll(){
        $connection = Yii::$app->db;
        $command = $connection->createCommand('

           select * from  azir_indexses ');

        $result=$command->queryAll();

        print_r($result);
        exit;
    }
    public function actionMigrate(){
        //table yaratmaq ucun


        try{
            $connection = Yii::$app->db;
            $command = $connection->createCommand('

           CREATE TABLE press_reliz_question (
  id SERIAL PRIMARY KEY ,
  press_reliz_id INTEGER NULL,
  question VARCHAR(255) NULL,
  question_en VARCHAR(255) NULL,
  visit INTEGER NULL,
  active BOOLEAN NULL,
   created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp
);  ');



            $command->execute();




            $connection = Yii::$app->db;
            $command = $connection->createCommand('

           CREATE TABLE press_reliz_statistics (
  id SERIAL PRIMARY KEY ,
  note TEXT NULL,
  press_reliz_id INTEGER NULL,
  val INTEGER NULL,
   created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp
);  ');



            $command->execute();
        }catch(\Exception $e){
            echo $e->getMessage();
            exit;
        }

        exit;








        $connection = Yii::$app->db;
        $command = $connection->createCommand('
        ALTER TABLE azir_indexses ADD COLUMN order_column INTEGER DEFAULT 0;
        ');
        $command->execute();





        $connection = Yii::$app->db;
        $command = $connection->createCommand('

           CREATE TABLE settings_saf (
  id SERIAL PRIMARY KEY ,
  key VARCHAR(255) NULL,
  value BOOLEAN NULL

);  ');

        $command->execute();




        SFTP::deleteFolders([Yii::getAlias('@admin') . '/runtime/cache']);
//        return $this->redirect(['azir/index']);

        echo 'Azir table order_column added successfully.';
//            exit;


    }


    public function actionBefore(){

        $show_before_day='show_before_day';
        $connection = Yii::$app->db;

        $command = $connection->createCommand("UPDATE settings_saf SET value = CASE WHEN value = true THEN false ELSE true END WHERE key = 'show_before_day';
");

        $result=$command->execute();


        return $this->redirect(['azir/index']);


    }
    public function actionRemove(){

        try {
            $connection = Yii::$app->db;
            $command = $connection->createCommand("TRUNCATE TABLE settings_saf;");
            $command->execute();






            $connection = Yii::$app->db;

            $deyer=1;

            $command = $connection->createCommand('
    SELECT * FROM settings_saf
');


            $res=$command->queryAll();


            print_r($res);
            exit;



        }catch (\Exception $e){
            echo $e->getMessage();
        }

        echo 'settings_saf table truncated successfully.';
        exit;

    }


    public function actionDelete(int $id){
        $connection = Yii::$app->db;
        $command = $connection->createCommand("DELETE FROM azir_indexses WHERE id=".$id.";");
        $result = $command->execute();

        return $this->redirect(['azir/index']);


    }

    public function actionUpload()
    {
        //$model = $this->azirViewModel;
        $model = new Azir();
        $model->scenario = 'upload'; //only for upload rules

        if (Yii::$app->request->isPost) {
            $model->file = UploadedFile::getInstance($model, 'file');

            if ($model->validate())
            {
                $uploadPath = Yii::getAlias('@visitor/web/compounded_term.pdf');
                if ($model->file->saveAs($uploadPath))
                {
                    $model->responseMessage = HtmlHelper::showAlert('Fayl uğurla yükləndi.', 'success');
                }
                else
                {
                    $model->responseMessage = HtmlHelper::showAlert('Fayl yadda saxlanılarkən xəta baş verdi.'.Yii::getAlias('@visitor/web/compounded_term.pdf'), 'danger');
                }
            }
            else
            {
                $model->responseMessage = HtmlHelper::showAlert('PDF formatı düzgün deyil.', 'danger');
            }


        }

        return $this->render('upload', [
            'model' => $model,
        ]);
    }
}
