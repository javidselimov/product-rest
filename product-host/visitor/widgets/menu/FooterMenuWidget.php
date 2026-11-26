<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\menu;

use common\models\Pages;

class FooterMenuWidget extends MenuWidget
{

    public function init()
    {
        $this->model = Pages::getFooterMenu(self::TOP_MENU_ID);
    }

}