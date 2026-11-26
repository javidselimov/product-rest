<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use Yii;
use common\models\AnnualStats;

//TODO Refactoring need. Test mode
class StatsViewModel
{

    private $connection;
    public $annualStatsModel;

    public function __construct(AnnualStats $annualStats)
    {
        $this->connection = Yii::$app->statsDB;
        $this->annualStatsModel = $annualStats;
    }

    public function getFirstVersion(int $parentID, int $limit)
    {
        $command = $this->connection->createCommand('select part_year as categories, amount as series, lvl_nm as name, year from mb_ovs_v01 where parent_id= ' . $parentID . ' ORDER BY year DESC, categories ASC LIMIT ' . $limit);
        $result = $command->queryAll();

        foreach ($result as $row) {
            $series[] = $row['series'];
            $categories[] = Yii::t('other', $row['categories']) . ' ' . $row['year'];
        }

        return [
            'series' => array_reverse($series),
            'categories' => array_reverse($categories)
        ];
    }

    public function getSecondVersion(int $parentID, int $limit)
    {
        $command = $this->connection->createCommand('select part_year as categories, amount as series, lvl_nm as name, lvl_id as lvl, year from mb_ovs_v01 where parent_id= ' . $parentID . ' ORDER BY year DESC, categories ASC LIMIT ' . $limit);
        $result = $command->queryAll();

        foreach ($result as $value) {
            $lvlValues[] = $value['lvl'];
        }

        $lvlValues = array_unique($lvlValues);

        foreach ($result as $row) {
            if ($row['lvl'] == max($lvlValues)) {
                $series[] = $row['series'];
                $name = Yii::t('other', mb_strtolower($row['name']));
            } elseif ($row['lvl']) {
                $series2[] = $row['series'];
                $name2 = Yii::t('other', mb_strtolower($row['name']));
            }

            $categories[] = Yii::t('other', $row['categories']) . ' ' . $row['year'];
        }

        return [
            'name' => $name,
            'name2' => $name2,
            'series' => array_reverse($series),
            'series2' => array_reverse($series2),
            'categories' => array_reverse(array_unique($categories))
        ];
    }

    public function getThirdVersion(int $parentID, int $limit)
    {
        $command = $this->connection->createCommand('select part_year as categories, amount as series, lvl_id as lvl, lvl_nm as name, year from mb_ovs_v01 where parent_id= ' . $parentID . ' and year<2022 ORDER BY year DESC, categories ASC, series DESC LIMIT ' . $limit);
        $result = $command->queryAll();

        foreach ($result as $row) {
            $labels[] = Yii::t('other', mb_strtolower($row['name']));
            $series[] = (float)$row['series'];
        }

        return [
            'labels' => $labels,
            'series' => $series,
        ];
    }


}