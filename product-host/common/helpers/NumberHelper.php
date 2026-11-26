<?php

namespace common\helpers;

class NumberHelper
{
    /**
     * Округляет число до 4 знаков после запятой, если их больше 4.
     */
    public static function roundIfNeeded($number)
    {
        if (is_numeric($number) && strpos((string)$number, '.') !== false) {
            $parts = explode('.', (string)$number);
            $decimal = isset($parts[1]) ? $parts[1] : '';
            if (strlen($decimal) > 4) {
                return round((float)$number, 4);
            }
        }
        return $number;
    }
}
