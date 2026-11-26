<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180316_071313_add_slug_column_to_pages_table extends Migration
{

    public function up()
    {
        $this->addColumn('pages', 'slug', $this->string()->notNull()->defaultValue(null));
    }

    public function down()
    {
        $this->dropColumn('pages', 'slug');
    }
}
