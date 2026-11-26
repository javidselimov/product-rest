<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180401_163257_create_gallery_images_table extends Migration
{
    const TABLE_NAME = '{{%gallery_images}}';

    public function up()
    {
        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'gallery_id' => $this->integer(),
            'creator_id' => $this->integer(),
            'filename' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp()->notNull(),
            'updated_at' => $this->timestamp()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-gallery_images-gallery_id',
            'gallery_images',
            'gallery_id',
            'gallery',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-gallery_images-creator_id',
            'gallery_images',
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