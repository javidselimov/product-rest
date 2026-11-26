<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use common\models\Pages;
use visitor\helpers\AnniversaryHelper;
use visitor\widgets\menu\PagesMenuWidget;

class PagesViewModel
{

    public $pagesModel;
    public $anniversaryHelper;

    public $page;
    public $pageID;
    public $pagesAssets;
    public $coverImage;

    public function __construct(Pages $pagesModel, AnniversaryHelper $anniversaryHelper)
    {
        $this->pagesModel = $pagesModel;
        $this->anniversaryHelper = $anniversaryHelper;
    }

    public function getCoverImage($pagesAssets)
    {
        $extensionsList = ['jpg', 'gif', 'png'];
        foreach ($pagesAssets as $asset) {
            $assetParams = pathinfo($asset['filename']);
            if (in_array($assetParams['extension'], $extensionsList) and $asset['cover']) {
                return $asset['filename'];
            }
        }
    }

    public function showPagesMenu()
    {
        if ($this->page['parent_id'] == 1 || $this->page['parent_id'] == 2) {
            return PagesMenuWidget::widget([
                'pageID' => $this->pageID,
                'leftPosition' => $this->page->left_position,
                'rootID' => $this->page['parent_id']
            ]);
        }
    }

}