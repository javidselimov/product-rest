<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "mb_ovs_v01".
 *
 * @property string $parent_id
 * @property string $part_year
 * @property string $year
 * @property int $lvl_id
 * @property string $lvl_nm
 * @property string $amount
 * @property string $etl_dt_tm
 */
class AnnualStats extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'mb_ovs_v01';
    }

    /**
     * @return \yii\db\Connection the database connection used by this AR class.
     */
    public static function getDb()
    {
        return Yii::$app->get('statsDB');
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['parent_id', 'year', 'amount'], 'number'],
            [['lvl_id'], 'default', 'value' => null],
            [['lvl_id'], 'integer'],
            [['etl_dt_tm'], 'safe'],
            [['part_year', 'lvl_nm'], 'string', 'max' => 200],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'parent_id' => 'Parent ID',
            'part_year' => 'Part Year',
            'year' => 'Year',
            'lvl_id' => 'Lvl ID',
            'lvl_nm' => 'Lvl Nm',
            'amount' => 'Amount',
            'etl_dt_tm' => 'Etl Dt Tm',
        ];
    }
}
