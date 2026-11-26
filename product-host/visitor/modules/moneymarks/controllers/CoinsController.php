<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\moneymarks\controllers;

class CoinsController extends BaseController
{

    public function init()
    {
        parent::init();
        $this->moneyMarksViewModel->type = $this->moneyMarksViewModel::COINS_TYPE;
    }

}