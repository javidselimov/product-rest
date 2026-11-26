<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180620_062901_add_filename_en_columnt_to_pages_assets_table extends Migration
{
    const TABLE_NAME = '{{%pages_assets}}';

    public function up()
    {
        $this->renameColumn(self::TABLE_NAME, 'filename', 'filename_az');
        $this->addColumn(self::TABLE_NAME, 'filename_en', $this->string()->defaultValue(null));
    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'filename_en');
    }
}
