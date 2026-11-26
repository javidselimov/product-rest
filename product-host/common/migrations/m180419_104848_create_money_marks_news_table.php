<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180419_104848_create_money_marks_news_table extends Migration
{

    const TABLE_NAME = '{{%money_marks_news}}';


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
            'active' => $this->smallInteger()->defaultValue(1),
            'slug' => $this->string()->notNull(),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-money_marks_news-creator_id',
            'money_marks_news',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );
    }
}
