<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180409_065953_create_money_marks_table extends Migration
{
    const TABLE_NAME = '{{%money_marks}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'category_id' => $this->integer(),
            'type' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'front_image' => $this->string()->notNull(),
            'rear_image' => $this->string()->notNull(),
            'description_az' => $this->text()->notNull(),
            'description_en' => $this->text()->notNull(),
            'secure_az' => $this->text()->notNull(),
            'secure_en' => $this->text()->notNull(),
            'video_url' => $this->string()->notNull(),
            'slug' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-money_marks-creator_id',
            'money_marks',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-money_marks-category_id',
            'money_marks',
            'category_id',
            'money_marks_categories',
            'id',
            'CASCADE'
        );
    }

    public function down()
    {
        $this->dropTable(self::TABLE_NAME);
    }
}