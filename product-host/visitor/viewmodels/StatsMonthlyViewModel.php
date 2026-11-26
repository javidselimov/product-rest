<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace visitor\viewmodels;

use Yii;
use common\models\AnnualStats;

//TODO Refactoring need. Test mode
class StatsMonthlyViewModel
{

    private $connection;
    public $annualStatsModel;

    public function __construct(AnnualStats $annualStats)
    {
        $this->connection = Yii::$app->statsDB;
        $this->annualStatsModel = $annualStats;
    }

    public function getFirstVersion(int $parentID)
    {
        $command = $this->connection->createCommand('select amount as series, lvl_nm as name, year from mb_ovs_v02 where parent_id= ' . $parentID . ' and amount>0.7 ORDER BY year DESC LIMIT 13');
        $result = $command->queryAll();

        foreach ($result as $row) {
            $series[] = $row['series'];
            $categories[] = ucfirst(Yii::$app->formatter->asDate($row['year'], 'php:F Y'));
        }

        return [
            'series' => array_reverse($series),
            'categories' => array_reverse($categories)
        ];
    }

    public function getSecondVersion(int $parentID, int $limit)
    {
        $command = $this->connection->createCommand('select amount as series, lvl_nm as name, lvl_id as lvl, year from mb_ovs_v02 where parent_id= ' . $parentID . ' ORDER BY year DESC LIMIT ' . $limit);
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

            $categories[] = ucfirst(Yii::$app->formatter->asDate($row['year'], 'php:F Y'));
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
        $command = $this->connection->createCommand('select amount as series, lvl_nm as name, lvl_id as lvl, year from mb_ovs_v02 where parent_id= ' . $parentID . ' ORDER BY year DESC LIMIT ' . $limit);
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