<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\helpers;

use yii\widgets\Breadcrumbs as BreadcrumbsBase;

class Breadcrumbs extends BreadcrumbsBase
{

    public $tag = "ol";

    public $options = ['class' => 'breadcrumb p-0 m-0'];

    public $itemTemplate = "<li>{link}</li>\n";

    public $activeItemTemplate = "<li class=\"active\">{link}</li>\n";

}