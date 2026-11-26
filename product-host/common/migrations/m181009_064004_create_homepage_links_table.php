<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m181009_064004_create_homepage_links_table extends Migration
{
    const TABLE_NAME = '{{%homepage_links}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string(),
            'title_en' => $this->string(),
            'icon' => $this->string(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'url' => $this->string(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-homepage_links-creator_id',
            'homepage_links',
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