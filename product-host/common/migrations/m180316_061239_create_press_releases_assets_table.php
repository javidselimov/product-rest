<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180316_061239_create_press_releases_assets_table extends Migration
{
    const TABLE_NAME = '{{%press_releases_assets}}';

    public function safeUp()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'press_release_id' => $this->integer()->notNull(),
            'creator_id' => $this->integer()->notNull(),
            'title' => $this->string()->notNull(),
            'filename' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'created_at' => $this->timestamp()->notNull(),
            'updated_at' => $this->timestamp()->notNull(),
            'visible' => $this->smallInteger()->defaultValue(1),
        ]);

        $this->createIndex('press_releases_assets_NK1', self::TABLE_NAME, 'id');
        $this->createIndex('press_releases_assets_NK2', self::TABLE_NAME, 'press_release_id');
        $this->createIndex('press_releases_assets_NK3', self::TABLE_NAME, 'title');
        $this->createIndex('press_releases_assets_NK4', self::TABLE_NAME, 'filename');

        $this->addForeignKey(
            'fk-press-releases-assets-press_release_id',
            'press_releases_assets',
            'press_release_id',
            'press_releases',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-press-releases-assets-creator_id',
            'press_releases_assets',
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
