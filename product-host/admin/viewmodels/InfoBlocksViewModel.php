<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use visitor\viewmodels\InfoBlocksViewModel as VisitorInfoBlocksViewModel;

class InfoBlocksViewModel extends VisitorInfoBlocksViewModel
{

    public $alias;

    public function gridViewFilter($alias)
    {
        $dataProvider = $this->infoLinesModel->loadDataProvider(['alias' => $alias]);
        //Указываем сортировку
        $dataProvider->sort = ['defaultOrder' => ['date' => SORT_DESC]];
        return $dataProvider;
    }

}