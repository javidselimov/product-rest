<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use common\helpers\DateHelper;

class InfoLines extends MainModel
{

    public static function tableName()
    {
        return 'infolines';
    }

    public function rules()
    {
        return [
            /* Правила валидации для Add и Default */
            [['created_at', 'updated_at'], 'safe', 'on' => ['add', 'default']],
            [['date', 'value', 'alias'], 'required', 'on' => ['add', 'default']],
            [['date', 'value', 'alias'], 'string', 'on' => ['add', 'default']],
        ];
    }

    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'date' => Yii::t('model', 'Date'),
            'created_at' => Yii::t('model', 'Created-Date'),
            'updated_at' => Yii::t('model', 'Updated-Date'),
            'alias' => Yii::t('model', 'Alias'),
            'value' => Yii::t('model', 'Value'),
        ];
    }

    public function beforeSave($insert)
    {
        $this->formatDate();
        return parent::beforeSave($insert);
    }

    public function afterFind()
    {
        parent::afterFind();

        // Преобразуем Unix timestamp в формат 'Y-m-d' для отображения в форме
        if (is_numeric($this->date)) {
            $this->date = date('Y-m-d', $this->date);
        }
    }

    /* Конвертирование даты в Unix Timestamp */
    private function formatDate()
    {
        //if ($this->scenario == 'add')
        return $this->date = strtotime($this->date);
    }

    public static function getLastValueByAlias(string $alias)
    {
        return self::getDb()->cache(function ($db) use ($alias) {
            return self::find()->select(['date', 'value'])->where(['alias' => $alias])->orderBy(['id' => SORT_DESC])->one();
        }, Yii::$app->params['dbCacheTimeout']);
    }

    public function getAllValueByAlias(string $alias)
    {
        return self::find()->select(['date', 'value'])->where(['alias' => $alias])->orderBy(['date' => SORT_DESC])->asArray()->all();
    }

    /** @return self */
    public function getValuesByYear(string $alias, int $year = null)
    {
        if ($year == null) $year = date("Y");
        $dateFrom = DateHelper::dateToTimeStamp('01/01/' . $year);
        $dateTo = DateHelper::dateToTimeStamp('31/12/' . $year);
        return self::find()->select(['date', 'value'])->where(['alias' => $alias])->andwhere(['between', 'date', $dateFrom, $dateTo])->orderBy(['date' => SORT_DESC])->asArray()->all();
    }

    public static function getAvailableAliases()
    {
        //bagladim kommente aldim acarsan
//        return self::getDb()->cache(function ($db) {
            return self::find()->select('alias')->distinct()->asArray()->all();
//        }, Yii::$app->params['dbCacheTimeout']);
    }

}
