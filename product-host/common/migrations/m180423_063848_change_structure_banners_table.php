<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180423_063848_change_structure_banners_table extends Migration
{

    const TABLE_NAME = '{{%banners}}';

    public function up()
    {

        $this->addColumn('banners', 'clean', $this->smallInteger()->notNull()->defaultValue(0));
        $this->renameTable('banners', 'banners_old');

        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string(),
            'title_en' => $this->string(),
            'background' => $this->string(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'url' => $this->string(),
            'active' => $this->smallInteger()->defaultValue(1),
            'clean' => $this->smallInteger()->notNull()->defaultValue(0),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-banners-creator_id',
            'banners',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );

        $this->execute('
        insert into banners (creator_id, title_az, title_en, background, position, url, active, clean, created_at, updated_at) 
        select creator_id, title_az, title_en, background, position, url, active, clean, created_at, updated_at from banners_old;
        ');

        $this->dropTable('banners_old');

    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'clean');
    }

}
