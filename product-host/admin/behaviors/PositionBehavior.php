<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

namespace admin\behaviors;

use yii\base\Behavior;
use yii\base\ModelEvent;
use yii\db\BaseActiveRecord;

/**
 * @property BaseActiveRecord $owner owner ActiveRecord instance.
 */
class PositionBehavior extends Behavior
{
    /* @var string */
    public $positionAttribute = 'position';
    /* @var array */
    public $groupAttributes = [];
    /* @var integer */
    private $positionOnSave;

    /* @return boolean */
    public function movePrev()
    {
        $positionAttribute = $this->positionAttribute;

        /* @var $previousRecord BaseActiveRecord */
        $previousRecord = $this->owner->find()
            ->andWhere($this->createGroupConditionAttributes())
            ->andWhere([$positionAttribute => ($this->owner->$positionAttribute - 1)])
            ->one();

        if (empty($previousRecord)) {
            return false;
        }

        $previousRecord->updateAttributes([
            $positionAttribute => $this->owner->$positionAttribute,
        ]);

        $this->owner->updateAttributes([
            $positionAttribute => $this->owner->$positionAttribute - 1,
        ]);

        return true;
    }

    /* @return boolean */
    public function moveNext()
    {
        $positionAttribute = $this->positionAttribute;

        /* @var $nextRecord BaseActiveRecord */
        $nextRecord = $this->owner->find()
            ->andWhere($this->createGroupConditionAttributes())
            ->andWhere([$positionAttribute => ($this->owner->$positionAttribute + 1)])
            ->one();

        if (empty($nextRecord)) {
            return false;
        }

        $nextRecord->updateAttributes([
            $positionAttribute => $this->owner->$positionAttribute,
        ]);

        $this->owner->updateAttributes([
            $positionAttribute => $this->owner->getAttribute($positionAttribute) + 1,
        ]);

        return true;
    }

    /* @return boolean */
    public function moveFirst()
    {
        $positionAttribute = $this->positionAttribute;
        if ($this->owner->$positionAttribute == 1) {
            return false;
        }

        $this->owner->updateAllCounters(
            [
                $positionAttribute => +1,
            ],
            [
                'and',
                $this->createGroupConditionAttributes(),
                ['<', $positionAttribute, $this->owner->$positionAttribute],
            ]
        );

        $this->owner->updateAttributes([
            $positionAttribute => 1,
        ]);

        return true;
    }

    /* @return boolean */
    public function moveLast()
    {
        $positionAttribute = $this->positionAttribute;

        $recordsCount = $this->countGroupRecords();
        if ($this->owner->getAttribute($positionAttribute) == $recordsCount) {
            return false;
        }

        $this->owner->updateAllCounters(
            [
                $positionAttribute => -1,
            ],
            [
                'and',
                $this->createGroupConditionAttributes(),
                ['>', $positionAttribute, $this->owner->$positionAttribute],
            ]
        );

        $this->owner->updateAttributes([
            $positionAttribute => $recordsCount,
        ]);

        return true;
    }

    /**
     * Перемещение на позицию
     * @param integer $position number of the new position.
     * @return boolean movement successful.
     */
    public function moveToPosition($position)
    {
        if (!is_numeric($position) || $position < 1) {
            return false;
        }

        $positionAttribute = $this->positionAttribute;

        $oldRecord = $this->owner->findOne($this->owner->getPrimaryKey());

        $oldRecordPosition = $oldRecord->$positionAttribute;

        if ($oldRecordPosition == $position) {
            return true;
        }

        if ($position < $oldRecordPosition) {
            // Вверх:
            $this->owner->updateAllCounters(
                [
                    $positionAttribute => +1,
                ],
                [
                    'and',
                    $this->createGroupConditionAttributes(),
                    ['>=', $positionAttribute, $position],
                    ['<', $positionAttribute, $oldRecord->$positionAttribute],
                ]
            );

            $this->owner->updateAttributes([
                $positionAttribute => $position,
            ]);

            return true;
        } else {
            // Вниз:
            $recordsCount = $this->countGroupRecords();
            if ($position >= $recordsCount) {
                return $this->moveLast();
            }

            $this->owner->updateAllCounters(
                [
                    $positionAttribute => -1,
                ],
                [
                    'and',
                    $this->createGroupConditionAttributes(),
                    ['>', $positionAttribute, $oldRecord->$positionAttribute],
                    ['<=', $positionAttribute, $position],
                ]
            );

            $this->owner->updateAttributes([
                $positionAttribute => $position,
            ]);

            return true;
        }
    }

    /**
     * Создаем массив по параметрам
     * @see groupAttributes
     * @return array attribute conditions.
     */
    protected function createGroupConditionAttributes()
    {
        $condition = [];
        if (!empty($this->groupAttributes)) {
            foreach ($this->groupAttributes as $attribute) {
                $condition[$attribute] = $this->owner->$attribute;
            }
        }
        return $condition;
    }

    /**
     * Определяет количество записей, принадлежащих группе владельца.
     * @see groupAttributes
     * @return integer records count.
     */
    protected function countGroupRecords()
    {
        $query = $this->owner->find();
        if (!empty($this->groupAttributes)) {
            $query->andWhere($this->createGroupConditionAttributes());
        }
        return $query->count();
    }

    /*
     * События
     * @return array
     */
    public function events()
    {
        return [
            BaseActiveRecord::EVENT_BEFORE_INSERT => 'beforeInsert',
            BaseActiveRecord::EVENT_BEFORE_UPDATE => 'beforeUpdate',
            BaseActiveRecord::EVENT_AFTER_INSERT => 'afterSave',
            BaseActiveRecord::EVENT_AFTER_UPDATE => 'afterSave',
            BaseActiveRecord::EVENT_BEFORE_DELETE => 'beforeDelete',
        ];
    }

    /* @param ModelEvent $event event instance. */
    public function beforeInsert($event)
    {
        if (!$this->owner->hasProperty($this->positionAttribute)) return false;

        $positionAttribute = $this->positionAttribute;
        if ($this->owner->$positionAttribute > 0) {
            $this->positionOnSave = $this->owner->$positionAttribute;
        }
        $this->owner->$positionAttribute = $this->countGroupRecords() + 1;
    }

    /* @param ModelEvent $event event instance. */
    public function beforeUpdate($event)
    {
        if (!$this->owner->hasProperty($this->positionAttribute)) return false;

        $positionAttribute = $this->positionAttribute;

        $isNewGroup = false;
        foreach ($this->groupAttributes as $groupAttribute) {
            if ($this->owner->isAttributeChanged($groupAttribute, false)) {
                $isNewGroup = true;
                break;
            }
        }

        if ($isNewGroup) {
            $oldRecord = $this->owner->findOne($this->owner->getPrimaryKey());
            $oldRecord->moveLast();
            $this->positionOnSave = $this->owner->$positionAttribute;
            $this->owner->$positionAttribute = $this->countGroupRecords() + 1;
        } else {
            if ($this->owner->isAttributeChanged($positionAttribute, false)) {
                $this->positionOnSave = $this->owner->$positionAttribute;
                $this->owner->$positionAttribute = $this->owner->getOldAttribute($positionAttribute);
            }
        }
    }

    /* @param ModelEvent $event event instance. */
    public function afterSave($event)
    {
        if (!$this->owner->hasProperty($this->positionAttribute)) return false;

        if ($this->positionOnSave !== null) {
            $this->moveToPosition($this->positionOnSave);
        }
        $this->positionOnSave = null;
    }

    /* @param ModelEvent $event event instance. */
    public function beforeDelete($event)
    {
        if (!$this->owner->hasProperty($this->positionAttribute)) return false;
        $this->moveLast();
    }
}