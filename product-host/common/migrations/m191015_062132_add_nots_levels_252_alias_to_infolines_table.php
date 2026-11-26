<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m191015_062132_add_nots_levels_252_alias_to_infolines_table extends Migration
{
    public function up()
    {

        $this->insert('infolines', [
            'alias' => 'nots_levels_252',
            'date' => '1570579200',
            'value' => 'none',
            'created_at' => '2019-10-09 11:16:27.015555',
            'updated_at' => '2019-10-09 11:16:27.015555',
            'creator_id' => '1',
            'active' => '1',
        ]);

    }
}
