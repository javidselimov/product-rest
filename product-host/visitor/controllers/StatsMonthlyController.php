<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\controllers;

use Yii;
use yii\base\Module;
use yii\web\Response;
use visitor\viewmodels\StatsMonthlyViewModel;

//TODO Refactoring need. Test mode
class StatsMonthlyController extends MainController
{

    public $statsViewModel;

    public function __construct($id, Module $module, array $config = [], StatsMonthlyViewModel $statsViewModel)
    {
        $this->statsViewModel = $statsViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionFirst(int $id)
    {
        return Yii::createObject([
            'class' => Response::class,
            'format' => Response::FORMAT_JSON,
            'data' => $this->statsViewModel->getFirstVersion($id)
        ]);
    }

    public function actionSecond(int $id, int $limit = 8)
    {
        return Yii::createObject([
            'class' => Response::class,
            'format' => Response::FORMAT_JSON,
            'data' => $this->statsViewModel->getSecondVersion($id, $limit)
        ]);
    }

    public function actionThird(int $id, int $limit = 8)
    {
        return Yii::createObject([
            'class' => Response::class,
            'format' => Response::FORMAT_JSON,
            'data' => $this->statsViewModel->getThirdVersion($id, $limit)
        ]);
    }
}