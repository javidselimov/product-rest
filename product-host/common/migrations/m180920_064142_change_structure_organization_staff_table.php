<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m180920_064142_change_structure_organization_staff_table extends Migration
{

    const TABLE_NAME = '{{%organization_staff}}';

    public function up()
    {

        $this->addColumn(self::TABLE_NAME, 'name_en', $this->string()->notNull()->defaultValue(''));
        $this->addColumn(self::TABLE_NAME, 'job_en', $this->string()->notNull()->defaultValue(''));
        $this->addColumn(self::TABLE_NAME, 'reception_days_en', $this->string()->notNull()->defaultValue(''));
        $this->renameTable('organization_staff', 'organization_staff_old');

        $this->createTable(self::TABLE_NAME, [
            'id' => $this->primaryKey(),
            'creator_id' => $this->integer(),
            'name_az' => $this->string()->notNull(),
            'name_en' => $this->string()->notNull(),
            'job_az' => $this->string()->notNull(),
            'job_en' => $this->string()->notNull(),
            'type' => $this->smallInteger()->notNull(),
            'position' => $this->smallInteger()->notNull()->defaultValue(1),
            'phone' => $this->string()->notNull(),
            'photo' => $this->string()->notNull(),
            'about_az' => $this->text()->notNull(),
            'about_en' => $this->text()->notNull(),
            'reception_days_az' => $this->string()->notNull(),
            'reception_days_en' => $this->string()->notNull(),
            'active' => $this->smallInteger()->defaultValue(1),
            'created_at' => $this->timestamp(),
            'updated_at' => $this->timestamp(),
        ]);

        $this->addForeignKey(
            'fk-organization_staff-creator_id',
            'organization_staff',
            'creator_id',
            'users',
            'id',
            'CASCADE'
        );

        $this->execute('
        insert into organization_staff (creator_id, name_az, name_en, job_az, job_en, type, position, phone, photo, about_az, about_en, reception_days_az, reception_days_en, active, created_at, updated_at) 
        select creator_id, name, name_en, job, job_en, type, position, phone, photo, about_az, about_en, reception_days, reception_days_en, active, created_at, updated_at from organization_staff_old;
        ');

        $this->dropTable('organization_staff_old');

    }

    public function down()
    {
        $this->dropColumn(self::TABLE_NAME, 'name_en');
        $this->dropColumn(self::TABLE_NAME, 'job_en');
        $this->dropColumn(self::TABLE_NAME, 'reception_days_en');
        $this->renameColumn(self::TABLE_NAME, 'name_az', 'name');
        $this->renameColumn(self::TABLE_NAME, 'job_az', 'job');
        $this->renameColumn(self::TABLE_NAME, 'reception_days_az', 'reception_days');
        $this->renameTable('organization_staff_old', self::TABLE_NAME);
    }
}
