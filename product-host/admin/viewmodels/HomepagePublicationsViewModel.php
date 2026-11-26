<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\viewmodels;

use common\models\HomepagePublications;

class HomepagePublicationsViewModel
{
    public $homepagePublications;

    public function __construct(HomepagePublications $homepagePublications)
    {
        $this->homepagePublications = $homepagePublications;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->homepagePublications->loadDataProvider();
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['position' => SORT_ASC]];
        return $dataProvider;
    }

}
