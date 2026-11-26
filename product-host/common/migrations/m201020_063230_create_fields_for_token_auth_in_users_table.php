<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
 */

use yii\db\Migration;

class m201020_063230_create_fields_for_token_auth_in_users_table extends Migration
{
    public function up()
    {
        $this->addColumn('users', 'access_token', $this->string('255')->defaultValue(null));
        $this->addColumn('users', 'expire_at', $this->integer('11')->defaultValue(null));
    }

    public function down()
    {
        $this->dropColumn('products', 'access_token');
        $this->dropColumn('products', 'expire_at');
    }
}