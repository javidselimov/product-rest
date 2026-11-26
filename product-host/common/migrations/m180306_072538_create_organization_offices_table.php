<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180306_072538_create_organization_offices_table extends Migration
{
    const TABLE_NAME = '{{%organization_offices}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'director_name' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'photo' => $this->string()->notNull(),
            'adress' => $this->string()->notNull(),
            'phone' => $this->string()->notNull(),
            'filename' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-organization_offices-creator_id',
            'organization_offices',
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
