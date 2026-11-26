<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m200916_112615_add_deposit_columns_to_infolines_table extends Migration
{
    public function up()
    {

        $this->insert('infolines', [
            'alias' => 'deposit_volume',
            'date' => '1598832000',
            'value' => '250',
            'created_at' => '2020-09-16',
            'updated_at' => '2020-09-16',
            'creator_id' => '1',
            'active' => '1',
        ]);
        $this->insert('infolines', [
            'alias' => 'deposit_levels_14',
            'date' => '1598832000',
            'value' => '6,26%',
            'created_at' => '2020-09-16',
            'updated_at' => '2020-09-16',
            'creator_id' => '1',
            'active' => '1',
        ]);
        $this->insert('infolines', [
            'alias' => 'deposit_levels_28',
            'date' => '1584489600',
            'value' => '—',
            'created_at' => '2020-09-16',
            'updated_at' => '2020-09-16',
            'creator_id' => '1',
            'active' => '1',
        ]);

    }
}
