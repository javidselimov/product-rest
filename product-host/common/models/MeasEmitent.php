<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

/**
 *
 * @property int $id
 * @property string $name_az
 * @property string $name_en
 * @property string $created_at
 * @property string $updated_at
 *
 * @property Meas[] $meas
 */
class MeasEmitent extends MainModel
{
    public static function tableName()
    {
        return 'meas_emitent';
    }

    public function behaviors()
    {
        return [
            'timestamp' => [
                'class' => 'yii\behaviors\TimestampBehavior',
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['created_at', 'updated_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['updated_at'],
                ],
                'value' => new \yii\db\Expression('NOW()'),
            ],
        ];
    }

    public function rules()
    {
        return [
            [['name_az', 'name_en'], 'required', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['name_az', 'name_en'], 'string', 'max' => 255, 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => Yii::t('model', 'ID'),
            'name_az' => Yii::t('model', 'Name-Az'),
            'name_en' => Yii::t('model', 'Name-En'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getMeas()
    {
        return $this->hasMany(Meas::className(), ['emitent_id' => 'id']);
    }

    public function getAllEmitents()
    {
        return MeasEmitent::find()->orderBy(['name_az' => SORT_ASC])->all();
    }
}
