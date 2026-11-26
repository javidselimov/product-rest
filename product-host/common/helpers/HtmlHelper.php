<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\helpers;

class HtmlHelper
{
    public static function clearSpaces(string $value)
    {
        return preg_replace('/\s+/', '', $value);
    }

    public static function getValueFromArray(array $array, string $value)
    {
        $arrayList = $array;
        foreach ($arrayList as $key => $arrayValue) {
            if ($value == $key) {
                return $arrayValue;
            }
        }
    }
}