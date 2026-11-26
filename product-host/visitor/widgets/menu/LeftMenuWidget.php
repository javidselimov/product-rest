<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\menu;

use common\models\Pages;

class LeftMenuWidget extends MenuWidget
{

    public function init()
    {
        $this->model = Pages::getTreeByParentID(self::LEFT_MENU_ID);
        $this->ulOptions = [
            'true' => ['id' => 'leftMenu', 'class' => 'nav'],
            'false' => [],
        ];
    }

}