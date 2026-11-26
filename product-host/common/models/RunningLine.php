<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "running_line".
 *
 * @property int $id
 * @property string $line_text_az
 * @property string $line_text_en
 * @property string|null $link_az
 * @property string|null $link_en
 * @property bool $activity
 * @property string $updated_at
 *
 * @property-read string $text
 * @property-read string|null $link
 */
class RunningLine extends MainModel
{

    /**
     * Check if the database table has the new structure
     * 
     * @return bool
     */

    /**
     * Getter for line_text_az
     * 
     * @return string
     */
    public function getLine_text_az()
    {
        return $this->getAttribute('line_text_az');
    }

    /**
     * Setter for line_text_az
     * 
     * @param string $value
     */
    public function setLine_text_az($value)
    {
        $this->setAttribute('line_text_az', $value);
    }

    /**
     * Getter for line_text_en
     * 
     * @return string
     */
    public function getLine_text_en()
    {
        return $this->getAttribute('line_text_en');
    }

    /**
     * Setter for line_text_en
     * 
     * @param string $value
     */
    public function setLine_text_en($value)
    {
        $this->setAttribute('line_text_en', $value);
    }

    /**
     * Getter for link_az
     * 
     * @return string
     */
    public function getLink_az()
    {
        return $this->getAttribute('link_az');
    }

    /**
     * Setter for link_az
     * 
     * @param string $value
     */
    public function setLink_az($value)
    {
        $this->setAttribute('link_az', $value);
    }

    /**
     * Getter for link_en
     * 
     * @return string
     */
    public function getLink_en()
    {
        return $this->getAttribute('link_en');
    }

    /**
     * Setter for link_en
     * 
     * @param string $value
     */
    public function setLink_en($value)
    {
        $this->setAttribute('link_en', $value);
    }
    public static function tableName()
    {
        return 'running_line';
    }

    public function rules()
    {
            return [
                [['line_text_az', 'line_text_en'], 'required'],
                [['line_text_az', 'line_text_en', 'link_az', 'link_en'], 'string'],
                [['activity'], 'boolean'],
                [['updated_at'], 'safe'],
            ];
    }

    /**
     * {@inheritdoc}
     */
    public function afterFind()
    {
        parent::afterFind();
    }

    /**
     * {@inheritdoc}
     */
    public function beforeSave($insert)
    {
        return parent::beforeSave($insert);
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'line_text_az' => Yii::t('model', 'Line Text (AZ)'),
            'line_text_en' => Yii::t('model', 'Line Text (EN)'),
            'link_az' => Yii::t('model', 'Link (AZ)'),
            'link_en' => Yii::t('model', 'Link (EN)'),
            'activity' => Yii::t('model', 'Activity'),
            'updated_at' => Yii::t('model', 'Updated At'),
        ];
    }

    /**
     * Активная бегущая строка (одна запись, id = 1)
     */
    public static function getActiveLine()
    {
        return self::find()
            ->where(['id' => 1, 'activity' => true])
            ->one();
    }

    /**
     * Текст в зависимости от языка сайта
     */
    public function getText()
    {
        $lang = substr(Yii::$app->language, 0, 2);

//        if (!in_array($lang, ['az', 'en'], true)) {
//            $lang = 'az';
//        }

        return $this->{'line_text_' . $lang};
    }

    /**
     * Ссылка в зависимости от языка сайта
     */
    public function getLink()
    {
        $lang = substr(Yii::$app->language, 0, 2);

//        if (!in_array($lang, ['az', 'en'], true)) {
//            $lang = 'az';
//        }

        return $this->{'link_' . $lang};
    }
}
