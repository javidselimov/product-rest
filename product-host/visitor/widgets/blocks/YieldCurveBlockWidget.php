<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\widgets\blocks;

use common\models\InfoLines;

class YieldCurveBlockWidget extends BlockWidget
{

    public $lastDate;

    public function init()
    {
        parent::init();
        $this->aliases = [
            'notsVolume' => InfoLines::getLastValueByAlias('nots_volume'),
            'notsLevels7' => InfoLines::getLastValueByAlias('nots_levels_7'),
            'notsLevels28' => InfoLines::getLastValueByAlias('nots_levels_28'),
            'notsLevels84' => InfoLines::getLastValueByAlias('nots_levels_84'),
            'notsLevels168' => InfoLines::getLastValueByAlias('nots_levels_168'),
            'notsLevels252' => InfoLines::getLastValueByAlias('nots_levels_252'),
            //'depositVolume' => InfoLines::getLastValueByAlias('deposit_volume'),
            //'depositLevels14' => InfoLines::getLastValueByAlias('deposit_levels_14'),
            //'depositLevels28' => InfoLines::getLastValueByAlias('deposit_levels_28'),
        ];
        $this->lastDate = $this->getLastDate();

    }

    public function run()
    {
        return $this->render('yield_curve', ['data' => $this->aliases, 'lastDate' => $this->lastDate]);
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
