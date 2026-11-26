<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\modules\moneymarks\viewmodels;

use Yii;
use yii\helpers\ArrayHelper;
use admin\modules\moneymarks\viewmodels\MoneyMarksViewModel as AdminMoneyMarksViewModel;

class MoneyMarksViewModel extends AdminMoneyMarksViewModel
{

    public function getCategory(int $categoryID)
    {
        return $this->moneyMarksCategoriesModel::findOne($categoryID);
    }

    public function getMoneyMarks(int $category, int $type)
    {
        return $this->moneyMarksModel::find()->where(['active' => '1', 'category_id' => $category, 'type' => $type])->orderBy(['position' => SORT_ASC])->asArray()->all();
    }

    public static function getMarksType(int $type)
    {
        return ArrayHelper::getValue(Yii::t('model', 'Money-Marks-Types'), $type);
    }

    public function getMarksByID(int $id)
    {
        return $this->moneyMarksModel::findOne($id);
    }

    public static function getDetailUrl(int $type)
    {
        return ($type == self::BANKNOTES_TYPE) ? 'banknotes/detail' : 'coins/detail';
    }

}