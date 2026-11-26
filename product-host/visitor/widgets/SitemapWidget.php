<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets;

use common\models\Pages;
use visitor\widgets\menu\MenuWidget;

class SitemapWidget extends MenuWidget
{

    public function init()
    {
        $topPages = Pages::getTreeByParentID(self::TOP_MENU_ID);
        $leftPages = Pages::getTreeByParentID(self::LEFT_MENU_ID);
        $sitemapList = array_merge($topPages, $leftPages);
        $this->model = $sitemapList;
        $this->ulOptions = [
            'true' => ['class' => 'list'],
            'false' => [],
        ];
    }

}