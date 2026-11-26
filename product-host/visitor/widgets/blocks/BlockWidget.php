<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use Yii;
use yii\base\Widget;

class BlockWidget extends Widget
{

    protected $aliases;

    public function init()
    {
        $this->aliases = Yii::t('other', 'infolines');
    }

}