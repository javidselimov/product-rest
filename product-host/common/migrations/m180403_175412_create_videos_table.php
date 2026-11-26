<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180403_175412_create_videos_table extends Migration
{
    const TABLE_NAME = '{{%videos}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'url' => $this->string(),
            'date' => $this->date()->notNull(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'active' => $this->smallInteger()->defaultValue(1),
            'slug' => $this->string()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-videos-creator_id',
            'videos',
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
