<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\menu;

use common\models\Pages;

class TopMenuWidget extends MenuWidget
{

    public function init()
    {
        $this->model = Pages::getTreeByParentID(self::TOP_MENU_ID);
        $this->ulOptions = [
            'true' => ['class' => 'menu'],
            'false' => ['class' => 'submenu'],
        ];
    }

}