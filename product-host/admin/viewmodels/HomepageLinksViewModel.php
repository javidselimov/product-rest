<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\HomepageLinks;

class HomepageLinksViewModel
{
    public $homepageLinks;

    public function __construct(HomepageLinks $homepageLinks)
    {
        $this->homepageLinks = $homepageLinks;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->homepageLinks->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}