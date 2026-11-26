<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180316_055500_create_press_releases_table extends Migration
{
    const TABLE_NAME = '{{%press_releases}}';

    public function safeUp()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'content_az' => $this->text()->notNull(),
            'content_en' => $this->text()->notNull(),
            'date' => $this->date()->notNull(),
            'type' => $this->smallInteger()->defaultValue(1),
            'active' => $this->smallInteger()->defaultValue(1),
            'slug' => $this->string()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-press_releases-creator_id',
            'press_releases',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}
