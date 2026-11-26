<?php

namespace common\models;

use admin\behaviors\UploadAssetsBehavior;
use Yii;
use yii\db\ActiveRecord;

/**
 *
 * @property int $id
 * @property int $emitent_id
 * @property int $info_type_id
 * @property int $doc_type_id
 * @property string $reg_date
 * @property string $dqn
 * @property string $file_path
 * @property int $active
 * @property string $created_at
 * @property string $updated_at
 *
 * @property MeasEmitent $emitent
 * @property MeasInfoType $infoType
 */
class Meas extends MainModel
{

    public static function tableName()
    {
        return 'meas';
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
            'UploadAssetsBehavior' => [
                'class' => UploadAssetsBehavior::className(),
                'attributes' => ['file_path'],
                'folder' => 'meas',
                'allowedExtension' => ['pdf'],
            ],
        ];
    }

    public function rules()
    {
        return [
            /* Правила валидации для Add и Default */
            [['emitent_id', 'info_type_id', 'reg_date'], 'required', 'on' => ['add', 'default']],
            [['file_path'], 'required', 'on' => ['add']],
            [['active'], 'default', 'value' => 1],
            [['emitent_id', 'info_type_id', 'doc_type_id', 'active'], 'default', 'value' => null, 'on' => ['add', 'default']],
            [['emitent_id', 'info_type_id', 'doc_type_id', 'active'], 'integer', 'on' => ['add', 'default']],
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['reg_date', 'dqn'], 'string', 'max' => 255, 'on' => ['add', 'default']],
            [['emitent_id'], 'exist', 'skipOnError' => true, 'targetClass' => MeasEmitent::className(), 'targetAttribute' => ['emitent_id' => 'id'], 'on' => ['add', 'default']],
            [['info_type_id'], 'exist', 'skipOnError' => true, 'targetClass' => MeasInfoType::className(), 'targetAttribute' => ['info_type_id' => 'id'], 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'emitent_id' => Yii::t('model', 'Emitent-ID'),
            'info_type_id' => Yii::t('model', 'Info-Type-ID'),
            'doc_type_id' => Yii::t('model', 'Doc-Type-ID'),
            'reg_date' => Yii::t('model', 'Registration-Date'),
            'dqn' => Yii::t('model', 'DQN'),
            'file_path' => Yii::t('model', 'Choose-File'),
            'active' => Yii::t('model', 'Status'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getEmitent()
    {
        return $this->hasOne(MeasEmitent::className(), ['id' => 'emitent_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getInfoType()
    {
        return $this->hasOne(MeasInfoType::className(), ['id' => 'info_type_id']);
    }
}
