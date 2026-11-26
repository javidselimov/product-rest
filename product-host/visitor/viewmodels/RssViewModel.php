<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use Yii;
use yii\base\Exception;
use common\models\PressReleases;

class RssViewModel
{

    public $pressReleasesModel;

    const DEFAULT_COUNT = 10;

    public function __construct(PressReleases $pressReleasesModel)
    {
        $this->pressReleasesModel = $pressReleasesModel;
    }

    public function checkLanguage()
    {
        $language = $_GET['language'];
        if (!in_array($language, ['az', 'en']) and !empty($language)) {
            throw new Exception('Invalid language');
        }
    }

    public function checkCount()
    {
        $count = $_GET['count'];
        if ($count > 50) {
            throw new Exception('Maximum count = 50');
        }
    }

}