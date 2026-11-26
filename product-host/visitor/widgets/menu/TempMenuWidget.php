<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\menu;

use Yii;
use yii\db\Query;
use common\models\Pages;

class TempMenuWidget extends MenuWidget
{
    public $headerTitle = true;
    public $singleMode = true;
    public $leftPosition;
    public $customID;

    public function init()
    {

        $subQuery = (new Query())
            ->select(['id', 'title_az', 'title_en', 'left_position'])
            ->from('pages')
            ->where(['<=', 'left_position', $this->leftPosition])
            ->andWhere(['=', 'depth', 1])
            ->andFilterWhere(['id' => $this->customID])
            ->orderBy(['parent_id' => SORT_ASC, 'left_position' => SORT_DESC])
            ->limit(1)
            ->one();

        $this->headerTitle = $subQuery['title_' . Yii::$app->language];
        //Задаем глобальный параметр для ParentMenuID
        Yii::$app->params['parentMenuID'] = $subQuery['id'];

        $query = Pages::find();
        $query->where(['parent_id' => self::LEFT_MENU_ID]);
        $query->andWhere(['!=', 'id', self::LEFT_MENU_ID]);
        $query->andWhere(['!=', 'id', 154]);
        $query->andWhere(['<=', 'id', 164]);
        $query->andWhere(['>=', 'left_position', $subQuery['left_position']]);
        $query->andWhere(['>', 'id', $subQuery['id']]);
        $query->addOrderBy('parent_id, left_position');
        if (Yii::$app->language == 'az') {
            $query->andWhere(['show_az' => 1]);
        } else {
            $query->andWhere(['show_en' => 1]);
        }

        $this->model = $query->all();
        $this->ulOptions = [
            'true' => ['id' => 'pagesMenu', 'class' => 'nav nav4'],
            'false' => [],
        ];


    }
}