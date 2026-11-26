<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;


class m180205_114936_create_pages_assets_table extends Migration
{

    const TABLE_NAME = '{{%pages_assets}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'page_id' => $this->integer()->notNull(),
            'creator_id' => $this->integer()->notNull(),
            'title' => $this->string()->notNull(),
            'filename' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'cover' => $this->smallInteger()->defaultValue(0),
            'created_at' => $this->timestamp()->notNull(),
            'updated_at' => $this->timestamp()->notNull(),
        ]);
        $this->createIndex('pages_assets_NK1', self::TABLE_NAME, 'id');
        $this->createIndex('pages_assets_NK2', self::TABLE_NAME, 'page_id');
        $this->createIndex('pages_assets_NK3', self::TABLE_NAME, 'title');
        $this->createIndex('pages_assets_NK4', self::TABLE_NAME, 'filename');

        $this->addForeignKey(
            'fk-page-assets-page_id',
            'pages_assets',
            'page_id',
            'pages',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-page-assets-creator_id',
            'pages_assets',
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
