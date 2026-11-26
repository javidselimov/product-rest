<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180920_074637_change_structure_organization_offices_table extends Migration
{
    const TABLE_NAME = '{{%organization_offices}}';

    public function up()
    {

        $this->addColumn(self::TABLE_NAME, 'director_name_en', $this->string()->notNull()->defaultValue(''));
        $this->addColumn(self::TABLE_NAME, 'adress_en', $this->string()->notNull()->defaultValue(''));
        $this->addColumn(self::TABLE_NAME, 'filename_en', $this->string()->notNull()->defaultValue(''));
        $this->renameTable('organization_offices', 'organization_offices_old');

        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'title_az' => $this->string()->notNull(),
            'title_en' => $this->string()->notNull(),
            'director_name_az' => $this->string()->notNull(),
            'director_name_en' => $this->string()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'photo' => $this->string()->notNull(),
            'adress_az' => $this->string()->notNull(),
            'adress_en' => $this->string()->notNull(),
            'phone' => $this->string()->notNull(),
            'filename_az' => $this->string()->notNull(),
            'filename_en' => $this->string()->notNull(),
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

        $this->execute('
        insert into organization_offices (creator_id, title_az, title_en, director_name_az, director_name_en, position, photo, adress_az, adress_en, phone, filename_az, filename_en, active, created_at, updated_at) 
        select creator_id, title_az, title_en, director_name, director_name_en, position, photo, adress, adress_en, phone, filename, filename_en, active, created_at, updated_at from organization_offices_old;
        ');

        $this->dropTable('organization_offices_old');

    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'director_name_en');
        $this->dropColumn(self::TABLE_NAME, 'adress_en');
        $this->dropColumn(self::TABLE_NAME, 'filename_en');
        $this->renameColumn(self::TABLE_NAME, 'director_name_az', 'director_name');
        $this->renameColumn(self::TABLE_NAME, 'adress_en', 'adress');
        $this->renameColumn(self::TABLE_NAME, 'filename_az', 'filename');
        $this->renameTable('organization_offices_old', self::TABLE_NAME);
    }
}