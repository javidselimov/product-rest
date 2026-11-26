<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use common\components\identity\UserIdentity;
use common\components\qradar\QradarLogger;
use common\components\qradar\QradarDescriptionBuilder;
use Yii;
use yii\filters\AccessControl;
use admin\viewmodels\UsersViewModel;
use admin\helpers\HtmlHelper;

class UsersController extends MainController
{

    public $usersViewModel;

    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['index', 'manage', 'change-status'],
                'rules' => [
                    [
                        'actions' => ['index', 'manage', 'change-status'],
                        'allow' => true,
                        'matchCallback' => function ($rule, $action) {
                            return Yii::$app->user->identity->role == UserIdentity::ADMIN_ROLE;
                        },
                    ],
                ],
            ],
        ];
    }

    public function __construct(string $id, \yii\base\Module $module, array $config = [], UsersViewModel $usersViewModel)
    {
        $this->usersViewModel = $usersViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {


        try {

//            $connection = Yii::$app->db;
//            $command = $connection->createCommand('drop table azir_indexses');
//            $command->execute();
//            echo 'silindi';
//            exit;

//            $connection = Yii::$app->db;
//            $command = $connection->createCommand('
//
//           CREATE TABLE azir_indexses (
//  id SERIAL PRIMARY KEY ,
//  title_az VARCHAR(255) NULL,
//  title_en VARCHAR(255) NULL,
//  faiz_az TEXT NULL,
//  faiz_en TEXT NULL,
//  eqd_hecm_az TEXT NULL,
//  eqd_hecm_en TEXT NULL,
//  eqd_say_az TEXT NULL,
//  eqd_say_en TEXT NULL,
//  content_en TEXT NULL,
//  date DATE NULL
//);  ');
//            $command->execute();

//            exit;










//            $connection = Yii::$app->db;
//            $command = $connection->createCommand("INSERT INTO azir_indexses (title_az, title_en, faiz_az, faiz_en, eqd_hecm_az, eqd_hecm_en, eqd_say_az, eqd_say_en, content_en, date)
//VALUES ('Başlık 1', 'Title 1', 'Faiz Açıklaması 1', 'Interest Description 1', 'Eqd Hecmi Açıklaması 1', 'Eqd Hecmi Description 1', 'Eqd Say Açıklaması 1', 'Eqd Say Description 1', 'Content 1', '".date('Y-m-d H:i:s')."');
//");
//            $result = $command->execute();
//







//            $connection = Yii::$app->db;
//            $command = $connection->createCommand('select * from azir_indexses');
//            $result = $command->queryAll();
//            echo "<pre>";
//            print_r($result);
//            exit;

        } catch( \Exception $e) {
//            echo $e->getMessage();
//            exit;
        }



        $model = $this->usersViewModel;

        $model->tableData = $model->gridViewFilter();
        return $this->render('index', ['model' => $model]);
    }

    public function actionManage(int $id = null)
    {
        $model = $this->usersViewModel;
        $usersModelClass = $model->usersModel;

        // Если $id передан – пытаемся загрузить пользователя. Иначе – создаём нового.
        if ($id === null)
        {
            $formModel = new $usersModelClass(['scenario' => 'add']); // Новый пользователь
            $isNew = true;
            $originalAttributes = []; // Нет старых данных
        }
        else
        {
            // Загрузка существующей модели
            $formModel = $usersModelClass::loadModel($id, ['scenario' => 'add']);
            $isNew = false;
            $originalAttributes = $formModel->getOldAttributes();
        }

        $model->formModel = $formModel;

        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());

            /* Валидация формы */
            if ($model->formModel->validate()) {




                $model->formModel->save();
                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');

                $logData = $isNew
                    ? QradarDescriptionBuilder::build('create', $model->formModel->getAttributes())
                    : QradarDescriptionBuilder::getChangedAttributesForLog($originalAttributes, $model->formModel->getAttributes());

                if ($isNew)
                {
                    QradarLogger::log("USER CREATED", "", null, $logData);
                }
                else
                {
                    // Логируем только если есть изменения
                    if(!empty($logData))
                        QradarLogger::log("USER UPDATED", "", null, $logData);
                }

                //QradarLogger::log($isNew ? "USER CREATED" : "USER UPDATED", "", null, $logData);
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('manage', ['model' => $model]);
    }

    public function actionChangeStatus(int $id)
    {
        $model = $this->usersViewModel->usersModel::loadModel($id);
        if ($model->changeRowStatus())
        {
            QradarLogger::log("USER STATUS CHANGE", "", null,
                QradarDescriptionBuilder::build('activation', $model)
            );
            return $this->redirect(['users/index']);
        }

        return $this->redirect(['home/index']);
    }

    public function actionProfile()
    {
        $model = $this->usersViewModel->getCurrentUserData();
        $model->scenario = 'profile';

        // Сохраняем оригинальные данные
        $originalAttributes = $model->getOldAttributes();

        if (Yii::$app->request->post()) {
            $model->load(Yii::$app->request->post());
            /* Валидация формы */
            if ($model->validate()) {
                $model->save();
                
                // Инвалидируем все активные сессии пользователя при смене пароля
                if (!empty($model->newPassword)) {
                    \common\models\UserSession::revokeAllForUser($model->id);
                }

                $model->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');

                $changes = QradarDescriptionBuilder::getChangedAttributesForLog(
                    $originalAttributes,
                    $model->getAttributes()
                );

                if(!empty($changes))
                    QradarLogger::log("USER PROFILE EDIT", "", null, $changes);

            } else {
                $errors = current($model->errors);
                $model->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
        } elseif (!isset($model)) {
            return $this->redirect(['index']);
        }
        return $this->render('profile', ['model' => $model]);
    }

}
