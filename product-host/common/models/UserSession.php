<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "user_sessions".
 *
 * @property int $id
 * @property string $session_hash
 * @property int $user_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string $created_at
 * @property string $last_activity
 * @property bool $is_revoked
 */
class UserSession extends ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'user_sessions';
    }

    /**
     * Создает хэш от ID сессии для безопасного хранения.
     * @param string $sessionId
     * @return string
     */
    public static function hashId($sessionId)
    {
        return hash('sha256', $sessionId);
    }

    /**
     * Регистрирует текущую сессию в базе данных при логине.
     * Также контролирует лимит активных сессий (не более 3-х).
     * @param int $userId
     * @return bool
     */
    public static function register($userId)
    {
        $sessionId = Yii::$app->session->id;
        if (!$sessionId) {
            Yii::$app->session->open();
            $sessionId = Yii::$app->session->id;
        }

        $hash = self::hashId($sessionId);

        // Проверяем, нет ли уже записи для этой сессии
        $model = self::findOne(['session_hash' => $hash]);
        if (!$model) {
            $model = new self();
            $model->session_hash = $hash;
        }

        $model->user_id = $userId;
        $model->ip_address = Yii::$app->request->userIP;
        $model->user_agent = Yii::$app->request->userAgent;
        $model->is_revoked = false;
        $model->last_activity = date('Y-m-d H:i:s');

        if ($model->save()) {
            self::limitSessions($userId);
            return true;
        }

        return false;
    }

    /**
     * Проверяет валидность текущей сессии (совпадение браузера и статус revoke).
     * @return bool
     */
    public static function validateCurrent()
    {
        if (Yii::$app->user->isGuest) {
            return true;
        }

        $sessionId = Yii::$app->session->id;
        if (!$sessionId) {
            return false;
        }

        $hash = self::hashId($sessionId);
        $model = self::findOne(['session_hash' => $hash, 'is_revoked' => false]);

        if (!$model) {
            // Если запись не найдена по текущему ID, возможно ID регенерировался.
            // В этом случае мы перерегистрируем текущий ID для этого пользователя.
            // Это решает проблему вылетов через 10-15 секунд из-за автоматической смены ID.
            return self::register(Yii::$app->user->id);
        }

        // Защита от Session Hijacking: проверяем User-Agent
        if ($model->user_agent !== Yii::$app->request->userAgent) {
            // Если браузер изменился при том же ID сессии - это подозрительно
            $model->is_revoked = true;
            $model->save();
            return false;
        }

        // Обновляем время последней активности
        $model->last_activity = date('Y-m-d H:i:s');
        $model->updateAttributes(['last_activity']);

        return true;
    }

    /**
     * Аннулирует ВСЕ сессии пользователя.
     * Полезно при смене пароля или требованиях безопасности.
     * @param int $userId
     */
    public static function revokeAllForUser($userId)
    {
        self::updateAll(['is_revoked' => true], ['user_id' => $userId]);
    }

    /**
     * Аннулирует текущую сессию (например, при выходе).
     */
    public static function revokeCurrent()
    {
        $sessionId = Yii::$app->session->id;
        if ($sessionId) {
            $hash = self::hashId($sessionId);
            self::updateAll(['is_revoked' => true], ['session_hash' => $hash]);
        }
    }

    /**
     * Ограничивает количество активных сессий пользователя до 3-х.
     * Удаляет или аннулирует самые старые.
     * @param int $userId
     */
    protected static function limitSessions($userId)
    {
        $limit = 3;
        $activeSessions = self::find()
            ->where(['user_id' => $userId, 'is_revoked' => false])
            ->orderBy(['last_activity' => SORT_DESC])
            ->all();

        if (count($activeSessions) > $limit) {
            $toRevoke = array_slice($activeSessions, $limit);
            foreach ($toRevoke as $session) {
                $session->is_revoked = true;
                $session->save();
            }
        }
    }
}
