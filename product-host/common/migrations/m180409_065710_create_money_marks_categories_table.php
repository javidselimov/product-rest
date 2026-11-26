<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180409_065710_create_money_marks_categories_table extends Migration
{
    const TABLE_NAME = '{{%money_marks_categories}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'description_az' => $this->text()->notNull(),
            'description_en' => $this->text()->notNull(),
            'slug' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-money_marks_categories-creator_id',
            'money_marks_categories',
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