<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace app\controllers;

use Yii;
use yii\console\Controller;

class SequenceController extends Controller
{

    public function actionRun()
    {
        $sequences = Yii::$app->db->createCommand('SELECT * FROM information_schema.sequences ORDER BY sequence_name ASC')->queryAll();
        foreach ($sequences as $sequence) {
            $sequence = $sequence['sequence_schema'] . '.' . $sequence['sequence_name'];
            $tableName = substr($sequence, 0, strpos($sequence, '_id'));
            $tables[] = str_replace('public.', '', $tableName);

            foreach ($tables as $table) {
                if (!empty($table)) {
                    if ($table == 'aznrates') {
                        $table = 'currency_rates';
                    }
                    $tableLastValue = Yii::$app->db->createCommand('SELECT max(id) as lastid from ' . $table)->queryOne();
                    $sequenceCurrentValue = $tableLastValue['lastid'] + 1;
                    Yii::$app->db->createCommand('ALTER SEQUENCE ' . $sequence . ' RESTART WITH ' . $sequenceCurrentValue)->execute();
                }
            }
        }
        echo 'Process finished!', PHP_EOL;
    }
}