<?php

namespace common\components;

use Yii;
use yii\i18n\Formatter as BaseFormatter;

class Formatter extends BaseFormatter
{
    public function asDate($value, $format = null)
    {
        $formattedDate = parent::asDate($value, $format);

        if (Yii::$app->language === 'az' || Yii::$app->language === 'az-AZ') {
            return mb_strtolower($formattedDate, 'UTF-8');
        }

        return $formattedDate;
    }

    public function asDatetime($value, $format = null)
    {
        $formattedDatetime = parent::asDatetime($value, $format);

        if (Yii::$app->language === 'az' || Yii::$app->language === 'az-AZ') {
            return mb_strtolower($formattedDatetime, 'UTF-8');
        }

        return $formattedDatetime;
    }
}
