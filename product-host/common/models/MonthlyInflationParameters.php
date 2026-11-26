<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "monthly_inflation_parameters".
 *
 * @property int $id
 * @property float $current_inflation
 * @property string $target_inflation
 * @property string $next_update_date
 */
class MonthlyInflationParameters extends MainModel
{
    public static function tableName()
    {
        return 'monthly_inflation_parameters';
    }

    public function behaviors()
    {
        return [];
    }

    public function rules()
    {
        return [
            [['current_inflation', 'target_inflation', 'next_update_date'], 'required'],
            [['target_inflation'], 'string', 'max' => 255],
            [['current_inflation'], 'number'],
            [['next_update_date'], 'safe'],
            [['id'], 'integer'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'current_inflation' => Yii::t('model', 'Current Inflation'),
            'target_inflation' => Yii::t('model', 'Target Inflation'),
            'next_update_date' => Yii::t('model', 'Next Update Date'),
        ];
    }
}
