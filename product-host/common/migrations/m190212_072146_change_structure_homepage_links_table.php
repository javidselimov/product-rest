<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m190212_072146_change_structure_homepage_links_table extends Migration
{
    const TABLE_NAME = '{{%homepage_links}}';

    public function up()
    {

        $this->addColumn(self::TABLE_NAME, 'url_en', $this->string());
        $this->renameColumn(self::TABLE_NAME, 'url', 'url_az');
        $this->renameTable('homepage_links', 'homepage_links_old');

        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string(),
            'title_en' => $this->string(),
            'icon' => $this->string(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'url_az' => $this->string()->notNull(),
            'url_en' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);


        $this->addForeignKey(
            'fk-homepage_links-creator_id',
            'homepage_links',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );

        $this->execute('
        insert into homepage_links (creator_id, title_az, title_en, icon, position, url_az, url_en, active, created_at, updated_at) 
        select creator_id, title_az, title_en, icon, position, url_az, url_az, active, created_at, updated_at from homepage_links_old;
        ');

        $this->dropTable('homepage_links_old');

    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'url_en');
        $this->renameColumn(self::TABLE_NAME, 'url_az', 'url');
    }
}
