<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use Yii;
use admin\viewmodels\InfoBlocksViewModel;
use admin\helpers\HtmlHelper;

class InfoBlocksController extends MainController
{

    public $infoBlocksViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], InfoBlocksViewModel $infoBlocksViewModel)
    {
        $this->infoBlocksViewModel = $infoBlocksViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(string $alias)
    {
        $model = $this->infoBlocksViewModel;
        $model->alias = $alias;
        $model->title = $model::getTitle($alias);

        //deaktiv etmisem 7 gunluk ucun cunki bazada 7 gunluk olmuyanda sehife acilmir
//        if ($model::checkAlias($alias)) {
            $model->tableData = $model->gridViewFilter($alias);
            return $this->render('index', ['model' => $model]);
//        } else {
//            return $this->redirect(['home/index']);
//        }
    }

    public function actionActive(){



        $show_before_day='show_7gunluk';
        $connection = Yii::$app->db;

        $command = $connection->createCommand("UPDATE settings_saf SET value = CASE WHEN value = true THEN false ELSE true END WHERE key = 'show_7gunluk';
");

        $result=$command->execute();



        return $this->redirect(['info-blocks/index?alias=nots_levels_7']);

    }

    public function actionManage($id = false, string $alias)
    {
        $model = $this->infoBlocksViewModel;
        $model->alias = $alias;
        $model->title = $model::getTitle($alias);
        $model->formModel = $model->infoLinesModel::loadModel($id, ['scenario' => 'add']);
        if (Yii::$app->request->post()) {
            $model->formModel->load(Yii::$app->request->post());
            $model->formModel->alias = $alias;
            /* Валидация формы */
            if ($model->formModel->validate()) {
                $model->formModel->save(false); // save без повторной валидации
                // Перезагрузка модели из базы, чтобы сработал afterFind и дата отформатировалась
                $model->formModel = $model->infoLinesModel::loadModel($model->formModel->id, ['scenario' => 'add']);
                $model->formModel->responseMessage = HtmlHelper::showAlert(Yii::t('app', 'Form-Success'), 'success');
            } else {
                $errors = current($model->formModel->errors);
                $model->formModel->responseMessage = HtmlHelper::showAlert($errors[0], 'danger');
            }
//        } elseif (!isset($model->formModel) or !$model::checkAlias($alias)) {
            //ustdeki olmalidi 7 gunluk ucun deaktiv edilib
        } elseif (!isset($model->formModel)) {
            return $this->redirect(['home/index']);
        }
        return $this->render('manage', ['model' => $model, 'formModel' => $model->formModel]);
    }

    public function actionDelete(int $id)
    {
        $model = $this->infoBlocksViewModel->infoLinesModel::loadModel($id);
        if ($model->delete()) {
            return $this->redirect(['info-blocks/index', 'alias' => $model['alias']]);
        } else {
            return $this->redirect(['home/index']);
        }
    }


}
