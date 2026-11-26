<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180316_071325_add_visible_column_to_pages_assets_table extends Migration
{
    public function up()
    {
        $this->addColumn('pages_assets', 'visible', $this->smallInteger()->defaultValue(1));
    }

    public function down()
    {
        $this->dropColumn('pages_assets', 'position');
    }
}
