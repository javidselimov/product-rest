<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use common\models\Azir;

class AZIRBlockWidget extends BlockWidget
{
    public $data;

    public function init()
    {
        parent::init();

        // Сразу забираем всё через collectData()
        $this->data = Azir::getDataForMainPage();
    }

    public function run()
    {
        return $this->render('azir.php', ['data' => $this->data]);
    }

}
