<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace visitor\helpers;

use yii\helpers\Html;
use yii\helpers\StringHelper;
use common\helpers\HtmlHelper as MainHtmlHelper;

class HtmlHelper extends MainHtmlHelper
{

    public static function showCurrencyRateIcon(string $lastCurrency = null, string $previousCurrency = null)
    {
        if ($lastCurrency > $previousCurrency) {
            echo Html::img('/images/table_up.png');
        } elseif ($lastCurrency < $previousCurrency) {
            echo Html::img('/images/table_down.png');
        } else {
            echo Html::img('/images/table_cur.png');
        }
    }

    public static function getYouTubeThumbnail(string $url)
    {
        $videoID = explode("v=", $url);
        $videoID = $videoID[1];
        return 'https://img.youtube.com/vi/' . $videoID . '/0.jpg';
    }

    public static function purifySearchText(string $text)
    {
        return StringHelper::truncateWords(preg_replace('/#([^ \\r\\	]+)/', '', $text), 50);
    }

    public static function currencyFormat(string $value = null)
    {
        return number_format($value, 4, '.', '');
    }

    public static function changeStringDateFormat(string $value = null)
    {
        if ($value != null) {
            $data = explode("/", $value);
            $year = $data[2];
            $month = $data[1];
            $day = $data[0];
            return $year . "-" . $month . "-" . $day;
        }
    }

}