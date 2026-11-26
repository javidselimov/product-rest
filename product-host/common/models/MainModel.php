<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace common\models;

use Yii;
use yii\data\ActiveDataProvider;
use yii\db\ActiveRecord;

class MainModel extends ActiveRecord
{

    const PAGE_SIZE = 8;
    public $responseMessage = null;
    public $clearAttributes = true;

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

    public function beforeSave($insert)
    {
        $this->setCreatorID();
        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes)
    {
        $this->clearAttributes();
        parent::afterSave($insert, $changedAttributes);
    }

    /* Функция очистки введенных данных при добавлении новой записи */
    private function clearAttributes()
    {
        $attributes = $this->attributes;
        if ($this->scenario == 'add' and $this->clearAttributes) {
            foreach ($attributes as $attribute => $value) {
                $this->$attribute = null;
            }
        }
    }

    /* Формируем и указываем ID пользователя, который работает над записями */
    private function setCreatorID()
    {
        if ($this->hasAttribute('creator_id')) {
            return $this->setAttribute('creator_id', Yii::$app->user->identity->id);
        }
    }

    /* Функция загрузки модели */
    public static function loadModel($id = false, $params = false, $isNewRecord = false)
    {
        $model = new static($params);
        if ($id != false and $isNewRecord == false) {
            $model = static::findOne($id);
        }
        return $model;
    }


    /* Функция загрузки данных для GridView. Значения по умолчанию  */
    public function loadDataProvider($condition = [])
    {
        $query = self::find()->where($condition);
        $sort = ['defaultOrder' => ['id' => SORT_DESC]];
        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort' => $sort,
            'pagination' => ['pageSize' => static::PAGE_SIZE],
        ]);
        if ($this->load(Yii::$app->request->get())) {
            $this->validate();
        }
        return $dataProvider;
    }

    /* Изменение статуса записи в БД (Active/Deactive) */
    public function changeRowStatus()
    {
        /** @var ActiveRecord $model */
        $model = $this->owner;
        $model->active == 1 ? $model->active = 0 : $model->active = 1;
        if ($model->save()) return true;
    }

}