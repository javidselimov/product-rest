<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use common\models\Azir;
use common\models\InfoLines;

class PulBazariBlockWidget extends BlockWidget
{

    public $data;

    public function init()
    {
        try {
            parent::init();
            $data=Azir::find()->orderBy(['date'=>SORT_DESC])->all();
            $this->data = $data;
        }catch (\Exception $e) {
            $this->data = [];
        }
    }

    public function run()
    {
        return $this->render('money.php', ['data' => $this->data]);
    }

    private function getLastDate()
    {
        $dates = [];
        foreach ($this->aliases as $alias) {
            $dates[] = $alias->date;
        }
        return max($dates);
    }

}
