<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace common\components\treeview;

use kartik\tree\TreeView as TreeViewBase;

class TreeView extends TreeViewBase
{

    public $fontAwesome = true;
    public $topRootAsHeading = true;
    public $isAdmin = true;
    public $softDelete = false;
    public $cacheSettings = ['enableCache' => true];
    public $showInactive = true;
    public $allowNewRoots = false;

}