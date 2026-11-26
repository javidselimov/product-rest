<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use Yii;
use common\models\InfoLines;

class InfoBlocksViewModel
{
    public $infoLinesModel;
    public $formModel;
    public $alias;
    public $title;
    public $year;
    public $tableData;

    public function __construct(InfoLines $infoLinesModel)
    {
        $this->infoLinesModel = $infoLinesModel;
    }

    public static function getCurrentYear(int $year = null)
    {
        $defaultYear = date("Y");
        if ($year == null) {
            return $defaultYear;
        } else {
            return $year;
        }
    }

    public static function checkAlias(string $alias)
    {
        $whiteList = InfoLines::getAvailableAliases();
        foreach ($whiteList as $key => $value) {
            if (in_array($alias, $value)) {
                return true;
            }
        }
    }

    public static function getTitle(string $alias)
    {
        $titleList = Yii::t('other', 'infolines');
        foreach ($titleList as $key => $value) {
            if ($alias == $key) {
                return $value;
            }
        }
    }

}
