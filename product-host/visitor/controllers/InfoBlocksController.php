<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use visitor\viewmodels\InfoBlocksViewModel;

class InfoBlocksController extends MainController
{

    public $infoBlocksViewModel;

    public function __construct($id, \yii\base\Module $module, array $config = [], InfoBlocksViewModel $infoBlocksViewModel)
    {
        $this->infoBlocksViewModel = $infoBlocksViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex(string $alias, int $year = null)
    {

        $model = $this->infoBlocksViewModel;
        $model->title = $model::getTitle($alias);
        $model->year = $model::getCurrentYear($year);
        if ($model::checkAlias($alias)) {
            $model->tableData = $model->infoLinesModel->getValuesByYear($alias, $year);
            $model->alias = $alias;


            $data=$model->tableData;

            usort($data, function ($a, $b){
                return $a['date']-$b['date'];
            });
            $filter=[];
            $deyerler=[];


            $lasttime=strtotime('2023-08-01');



            foreach ($data as $d){
                $val=$d['value'];

                if($d['date']>=$lasttime){
                    if($val!=$deyerler[count($deyerler)-1]){
                        $filter[]=$d;
                    }
                    $deyerler[]=$val;
                }else{
                    $filter[]=$d;

                }



            }


            usort($filter, function ($a, $b){
                return $b['date']-$a['date'];
            });

            $model->tableData=$filter;

            return $this->render('index', ['model' => $model]);
        } else {
            return $this->redirect(['home/index']);
        }
    }

}
