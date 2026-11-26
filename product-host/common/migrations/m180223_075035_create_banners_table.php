<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180223_075035_create_banners_table extends Migration
{
    const TABLE_NAME = '{{%banners}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string(),
            'title_en' => $this->string(),
            'background' => $this->string(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'url' => $this->string(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-banners-creator_id',
            'banners',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
