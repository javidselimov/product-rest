<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180306_083617_create_organization_divisions_table extends Migration
{
    const TABLE_NAME = '{{%organization_divisions}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'director_name' => $this->string()->notNull(),
            'director_email' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'filename' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-organization_divisions-creator_id',
            'organization_divisions',
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