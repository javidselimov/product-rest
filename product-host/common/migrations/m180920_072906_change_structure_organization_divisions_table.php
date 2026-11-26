<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180920_072906_change_structure_organization_divisions_table extends Migration
{
    const TABLE_NAME = '{{%organization_divisions}}';

    public function up()
    {

        $this->addColumn(self::TABLE_NAME, 'director_name_en', $this->string()->notNull()->defaultValue(''));
        $this->addColumn(self::TABLE_NAME, 'filename_en', $this->string()->notNull()->defaultValue(''));
        $this->renameTable('organization_divisions', 'organization_divisions_old');

        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'director_name_az' => $this->string()->notNull(),
            'director_name_en' => $this->string()->notNull(),
            'director_email' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'filename_az' => $this->string()->notNull(),
            'filename_en' => $this->string()->notNull(),
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

        $this->execute('
        insert into organization_divisions (creator_id, title_az, title_en, director_name_az, director_name_en, director_email, position, filename_az, filename_en, active, created_at, updated_at) 
        select creator_id, title_az, title_en, director_name, director_name_en, director_email, position, filename, filename_en, active, created_at, updated_at from organization_divisions_old;
        ');

        $this->dropTable('organization_divisions_old');

    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'director_name_en');
        $this->dropColumn(self::TABLE_NAME, 'filename_en');
        $this->renameColumn(self::TABLE_NAME, 'director_name_az', 'director_name');
        $this->renameColumn(self::TABLE_NAME, 'filename_az', 'filename');
        $this->renameTable('organization_divisions_old', self::TABLE_NAME);
    }
}