<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180620_112724_rename_filename_column_press_releases_table extends Migration
{
    const TABLE_NAME = '{{%press_releases_assets}}';

    public function up()
    {
        $this->renameColumn(self::TABLE_NAME, 'filename', 'filename_az');
    }

    public function down()
    {
        $this->renameColumn(self::TABLE_NAME, 'filename_az', 'filename');
    }
}
