<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\moneymarks\controllers;

use visitor\controllers\MainController;
use visitor\modules\moneymarks\viewmodels\MoneyMarksViewModel;

class BaseController extends MainController
{

    public $moneyMarksViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], MoneyMarksViewModel $moneyMarksViewModel)
    {
        $this->moneyMarksViewModel = $moneyMarksViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(int $category)
    {
        $model = $this->moneyMarksViewModel;
        $model->category = $model->getCategory($category);
        $model->tableData = $model->getMoneyMarks($category, $model->type);
        if ($model->category) {
            return $this->render('/base/index', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }

    public function actionDetail(int $id)
    {
        $model = $this->moneyMarksViewModel;
        $model->detailData = $model->getMarksByID($id);
        if ($model->detailData) {
            return $this->render('/base/detail', ['model' => $model]);
        } else {
            return $this->redirect(['/home/index']);
        }
    }

}