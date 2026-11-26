<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180622_065406_add_show_columns_to_pages_table extends Migration
{
    const TABLE_NAME = '{{%pages}}';

    public function up()
    {
        $this->addColumn(self::TABLE_NAME, 'show_az', $this->boolean()->notNull()->defaultValue(true));
        $this->addColumn(self::TABLE_NAME, 'show_en', $this->boolean()->notNull()->defaultValue(true));
    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'show_az');
        $this->dropColumn(self::TABLE_NAME, 'show_en');
    }
}