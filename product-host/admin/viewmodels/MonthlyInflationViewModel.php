<?
/*
 * Developed by Junie
*/

namespace admin\viewmodels;

use common\models\MonthlyInflationParameters;

class MonthlyInflationViewModel
{
    public $monthlyInflationModel;

    public function __construct(MonthlyInflationParameters $monthlyInflationModel)
    {
        $this->monthlyInflationModel = $monthlyInflationModel;
    }
}
