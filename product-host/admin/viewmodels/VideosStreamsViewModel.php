<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\viewmodels;

use common\models\VideosStreams;

class VideosStreamsViewModel
{
    public $videosStreamsModel;

    public $formModel;
    public $tableData;

    public function __construct(VideosStreams $videosModel)
    {
        $this->videosStreamsModel = $videosModel;
    }

    public function gridViewFilter()
    {
        $dataProvider = $this->videosStreamsModel->loadDataProvider();
        $dataProvider->sort = ['defaultOrder' => ['id' => SORT_ASC]];
        return $dataProvider;
    }

}