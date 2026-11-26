<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace admin\controllers;

use common\components\qradar\QradarLogger;
use Yii;
use yii\web\Controller;
use admin\viewmodels\LoginViewModel;
use yii\captcha\CaptchaAction;

class LoginController extends Controller
{
    public $loginViewModel;

    public function actions()
    {
        return [
            'captcha' => [
                'class' => 'common\components\NumericCaptchaAction',
                'minLength' => 4,
                'maxLength' => 5,
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }

    public function __construct(string $id, \yii\base\Module $module, array $config = [], LoginViewModel $loginViewModel)
    {
        $this->loginViewModel = $loginViewModel;
        parent::__construct($id, $module, $config);
    }

    public function actionIndex()
    {
        $ip = Yii::$app->request->userIP;
        $request = Yii::$app->request;
        $email = $request->post('LoginViewModel')['email'] ?? null;

        $lockUntil = $this->getLockUntil($ip, $email);
        if ($lockUntil > 0) {
            $remaining = $lockUntil - time();
            $minutes = ceil($remaining / 60);
            $message = Yii::t('app', 'Too many failed login attempts. Please try again in {n} minute(s).', ['n' => $minutes]);
            Yii::$app->session->setFlash('error', $message);
            return $this->render('index', ['model' => $this->loginViewModel]);
        } elseif ($email && Yii::$app->cache->get("login_user_{$email}")) {
            // Если блокировка по времени (lock) уже прошла, но старые счетчики остались - 
            // даем пользователю шанс войти, не сбрасывая всё сразу, но позволяя пройти валидацию.
            // Однако, лучше сбросить счетчик именно здесь, если мы уже прошли проверку на lock.
            // Но мы сбросим его только после успешного входа или в incrementCounters добавим логику.
        }

        if ($this->shouldShowCaptcha($ip, $email)) {
            $this->loginViewModel->scenario = 'withCaptcha';
        }

        if ($this->loginViewModel->load(Yii::$app->request->post())) {
            if ($this->isRateLimited($ip, $email)) {
                Yii::$app->session->setFlash('error', 'Rate limit exceeded. Please wait a moment.');
                return $this->render('index', ['model' => $this->loginViewModel]);
            }

            if ($this->loginViewModel->login()) {
                $session = Yii::$app->session;
                $session->regenerateID(true);

                $this->resetCounters($ip, $email);
                \common\models\UserSession::register(Yii::$app->user->id);
                QradarLogger::log("LOGIN SUCCESS", "User successfully logged in");
                return $this->goBack();
            }

            // Login failed
            $this->incrementCounters($ip, $email);
            usleep(rand(300000, 800000)); // 0.3–0.8 seconds
            QradarLogger::log("LOGIN FAILED", "User Login Failure", $email);
        }

        return $this->render('index', ['model' => $this->loginViewModel]);
    }

    private function getLockUntil($ip, $username)
    {
        if (!$username) return 0;
        $cache = Yii::$app->cache;
        $until = $cache->get("login_lock_{$username}");
        return $until ?: 0;
    }

    private function shouldShowCaptcha($ip, $username)
    {
        $cache = Yii::$app->cache;
        $attemptsIp = (int)$cache->get("login_ip_{$ip}");
        $attemptsUser = $username ? (int)$cache->get("login_user_{$username}") : 0;
        return $attemptsIp >= 2 || $attemptsUser >= 2;
    }

    private function isRateLimited($ip, $username)
    {
        $cache = Yii::$app->cache;

        // IP Limit: 10 per minute
        $ipKey = "rate_limit_ip_{$ip}";
        $ipCount = (int)$cache->get($ipKey);
        if ($ipCount >= 10) return true;

        // User Limit: 10 per 2 minutes
        if ($username) {
            $userKey = "rate_limit_user_{$username}";
            $userCount = (int)$cache->get($userKey);
            if ($userCount >= 10) return true;
        }

        // Combined Limit (optional refinement, but let's stick to simple ones first)
        return false;
    }

    private function incrementCounters($ip, $username)
    {
        $cache = Yii::$app->cache;

        // Если блокировка (lock) по времени уже истекла, но счетчик попыток остался,
        // мы должны начать считать заново, иначе первая же ошибка после разблокировки
        // приведет к повторному локу.
        $attemptsIp = (int)$cache->get("login_ip_{$ip}");
        $attemptsUser = $username ? (int)$cache->get("login_user_{$username}") : 0;

        // Если попыток было >= 5, но блокировки (lock) сейчас нет - значит время блока прошло.
        // Сбрасываем счетчик до 0, чтобы текущая ошибка стала первой.
        if ($attemptsIp >= 5 && !$cache->get("login_lock_ip_{$ip}")) {
            $attemptsIp = 0;
            $cache->delete("login_ip_{$ip}");
        }
        if ($username && $attemptsUser >= 5 && !$cache->get("login_lock_{$username}")) {
            $attemptsUser = 0;
            $cache->delete("login_user_{$username}");
        }

        // Failed attempts counters (for CAPTCHA and Lockout)
        $this->incCache("login_ip_{$ip}", 600); // 10 min TTL
        if ($username) {
            $this->incCache("login_user_{$username}", 600);
            $this->incCache("login_combo_{$ip}_{$username}", 600);
        }

        // Rate limit counters
        $this->incCache("rate_limit_ip_{$ip}", 60); // 1 min TTL
        if ($username) {
            $this->incCache("rate_limit_user_{$username}", 120); // 2 min TTL
        }

        // Check for lockout
        $attempts = (int)$cache->get("login_ip_{$ip}");
        if ($username) {
            $attempts = max($attempts, (int)$cache->get("login_user_{$username}"));
        }

        $lockDuration = 0;
        if ($attempts >= 20) $lockDuration = 900;
        elseif ($attempts >= 15) $lockDuration = 300;
        elseif ($attempts >= 10) $lockDuration = 180;
        elseif ($attempts >= 5) $lockDuration = 60;

        if ($lockDuration > 0 && $username) {
            $lockUntil = time() + $lockDuration;
            $cache->set("login_lock_{$username}", $lockUntil, $lockDuration);
            // Также ставим технический флаг для IP, чтобы понимать, что блок по времени активен
            $cache->set("login_lock_ip_{$ip}", true, $lockDuration);
            
            // Если сработал lockout - аннулируем все активные сессии этого пользователя
            // Это закрывает требование безопасности: "при lock out активные сессии должны прерываться"
            $userIdentity = \common\components\identity\UserIdentity::findByUsername($username);
            if ($userIdentity) {
                \common\models\UserSession::revokeAllForUser($userIdentity->id);
            }
        }
    }

    private function incCache($key, $duration)
    {
        $cache = Yii::$app->cache;
        $val = (int)$cache->get($key);
        $cache->set($key, $val + 1, $duration);
    }

    private function resetCounters($ip, $username)
    {
        $cache = Yii::$app->cache;
        $cache->delete("login_ip_{$ip}");
        $cache->delete("login_lock_ip_{$ip}");
        $cache->delete("rate_limit_ip_{$ip}");
        $cache->delete("login_lock_{$ip}");
        if ($username) {
            $cache->delete("login_user_{$username}");
            $cache->delete("login_combo_{$ip}_{$username}");
            $cache->delete("rate_limit_user_{$username}");
            $cache->delete("login_lock_{$username}");
        }
    }

    public function actionExit()
    {

        QradarLogger::log("SIGN OUT", "User successfully signout");
        \common\models\UserSession::revokeCurrent();
        Yii::$app->user->logout();
        return $this->redirect(['login/index']);
    }
}