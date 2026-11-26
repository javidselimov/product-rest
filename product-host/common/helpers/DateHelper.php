<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\helpers;

use Yii;
use DateTime;

class DateHelper
{

    const DEFAULT_FORMAT = 'd/m/Y';

    public static function checkDate(string $date, string $format = self::DEFAULT_FORMAT)
    {
        $value = DateTime::createFromFormat($format, $date);
        return $value && $value->format($format) == $date;
    }

    public static function showDate(string $date, string $format = 'dd/MM/yyyy')
    {
        return Yii::$app->formatter->asDate($date, "php:d.m.Y");
    }

    public static function convertToFormat(string $date, string $format = 'dd/MM/yyyy')
    {
        return Yii::$app->formatter->asDate($date, $format);
    }

    public static function dateToTimeStamp(string $date, string $format = self::DEFAULT_FORMAT)
    {
        return DateTime::createFromFormat('!' . $format, $date)->getTimestamp();
    }

    public static function translateMonth(string $date)
    {
        $englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $azerbaijaniMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];

        return str_replace($englishMonths, $azerbaijaniMonths, $date);
    }

}