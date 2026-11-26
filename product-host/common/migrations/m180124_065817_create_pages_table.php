<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180124_065817_create_pages_table extends Migration
{
    const TABLE_NAME = '{{%pages}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'parent_id' => $this->integer(),
            'creator_id' => $this->integer()->notNull(),
            'title_az' => $this->string(),
            'title_en' => $this->string(),
            'content_az' => $this->text(),
            'content_en' => $this->text(),
            'url' => $this->string(),
            'left_position' => $this->integer()->notNull(),
            'right_position' => $this->integer()->notNull(),
            'depth' => $this->smallInteger(5)->notNull(),
            'active' => $this->boolean()->notNull()->defaultValue(true),
            'selected' => $this->boolean()->notNull()->defaultValue(false),
            'disabled' => $this->boolean()->notNull()->defaultValue(false),
            'readonly' => $this->boolean()->notNull()->defaultValue(false),
            'visible' => $this->boolean()->notNull()->defaultValue(true),
            'collapsed' => $this->boolean()->notNull()->defaultValue(false),
            'movable_u' => $this->boolean()->notNull()->defaultValue(true),
            'movable_d' => $this->boolean()->notNull()->defaultValue(true),
            'movable_l' => $this->boolean()->notNull()->defaultValue(false),
            'movable_r' => $this->boolean()->notNull()->defaultValue(false),
            'removable' => $this->boolean()->notNull()->defaultValue(true),
            'removable_all' => $this->boolean()->notNull()->defaultValue(false),
            'created_at' => $this->timestamp()->notNull(),
            'updated_at' => $this->timestamp()->notNull(),
        ]);

        $this->createIndex('pages_NK1', self::TABLE_NAME, 'id');
        $this->createIndex('pages_NK2', self::TABLE_NAME, 'parent_id');
        $this->createIndex('pages_NK3', self::TABLE_NAME, 'left_position');
        $this->createIndex('pages_NK4', self::TABLE_NAME, 'right_position');
        $this->createIndex('pages_NK5', self::TABLE_NAME, 'depth');
        $this->createIndex('pages_NK6', self::TABLE_NAME, 'active');

        $this->addForeignKey(
            'fk-pages-creator_id',
            'pages',
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
