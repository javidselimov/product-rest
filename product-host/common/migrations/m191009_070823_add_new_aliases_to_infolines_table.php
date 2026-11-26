<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m191009_070823_add_new_aliases_to_infolines_table extends Migration
{

    public function up()
    {

        $this->update('infolines', ['alias' => 'nots_levels_28'], ['alias' => 'nots_levels']);

        $this->insert('infolines', [
            'alias' => 'nots_levels_84',
            'date' => '1570579200',
            'value' => '6.03%',
            'created_at' => '2019-10-09 11:16:27.015555',
            'updated_at' => '2019-10-09 11:16:27.015555',
            'creator_id' => '1',
            'active' => '1',
        ]);

        $this->insert('infolines', [
            'alias' => 'nots_levels_168',
            'date' => '1570579200',
            'value' => '6.06%',
            'created_at' => '2019-10-09 11:16:27.015555',
            'updated_at' => '2019-10-09 11:16:27.015555',
            'creator_id' => '1',
            'active' => '1',
        ]);

    }

}
