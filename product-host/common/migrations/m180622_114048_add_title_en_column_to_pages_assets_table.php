<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180622_114048_add_title_en_column_to_pages_assets_table extends Migration
{
    const TABLE_NAME = '{{%pages_assets}}';

    public function up()
    {
        $this->addColumn(self::TABLE_NAME, 'title_en', $this->string()->notNull()->defaultValue(''));
        $this->renameColumn(self::TABLE_NAME, 'title', 'title_az');
    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'title_en');
        $this->renameColumn(self::TABLE_NAME, 'title_az', 'title');
    }
}