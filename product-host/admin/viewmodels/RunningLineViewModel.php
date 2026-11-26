<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\RunningLine;

class RunningLineViewModel
{
    public $runningLineModel;

    public function __construct(RunningLine $runningLineModel)
    {
        $this->runningLineModel = $runningLineModel;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->runningLineModel->loadDataProvider();
        return $dataProvider;
    }
}