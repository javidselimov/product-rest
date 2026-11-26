<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\moneymarks\controllers;

class BanknotesController extends BaseController
{

    public function init()
    {
        parent::init();
        $this->moneyMarksViewModel->type = $this->moneyMarksViewModel::BANKNOTES_TYPE;
    }

}