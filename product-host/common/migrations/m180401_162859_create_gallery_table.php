<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180401_162859_create_gallery_table extends Migration
{
    const TABLE_NAME = '{{%gallery}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'date' => $this->date()->notNull(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'content_az' => $this->text()->notNull(),
            'content_en' => $this->text()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'active' => $this->smallInteger()->defaultValue(1),
            'slug' => $this->string()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-gallery-creator_id',
            'gallery',
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