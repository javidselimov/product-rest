<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use common\models\PressReleases;
use visitor\helpers\HtmlHelper;
use visitor\models\PressReleasesForm;

class PressReleasesViewModel
{
    public $pressReleasesModel;
    public $formModel;

    public $assetsFolder = 'press-releases';
    public $pressRelease;
    public $pressReleaseAssets;
    public $pressReleases;
    public $type;

    public function __construct(PressReleases $pressReleasesModel, PressReleasesForm $formModel)
    {
        $this->pressReleasesModel = $pressReleasesModel;
        $this->formModel = $formModel;
    }

    public function getPressReleases(int $type, string $dateFrom = null, string $dateTo = null)
    {
        $query = $this->pressReleasesModel::find()->where(['active' => '1', 'type' => $type]);
        if ($dateFrom != null or $dateTo != null) {
            $dateFrom = HtmlHelper::changeStringDateFormat($dateFrom);
            $dateTo = HtmlHelper::changeStringDateFormat($dateTo);
            $query->andwhere(['between', 'date', $dateFrom, $dateTo]);
        } else {
            $year = date("m") == 12 ? date("Y", strtotime("+1 years")) : date("Y");
            $dateFrom = date("Y") . '-' . date("m") . '-' . date("01");
            $dateTo = $year . '-' . date("m", strtotime("+1 months")) . '-' . date("01");
            $query->andwhere(['between', 'date', $dateFrom, $dateTo]);
        }
        $query->andWhere(['<=', 'date', date('Y-m-d')]);
        $query->orderBy(['date' => SORT_DESC, 'id' => SORT_DESC]);
        return $query;
    }

}