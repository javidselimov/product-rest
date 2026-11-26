<?php

namespace common\components;

use Yii;
use yii\web\Session;

class SecureSession extends Session
{
    public function init()
    {
        parent::init();
        if ($this->getIsActive()) {
            $this->verifySession();
        }
    }

    protected function verifySession()
    {
        $request = Yii::$app->request;
        $userAgent = $request->userAgent;

        $savedAgent = $this->get('__user_agent');

        if ($savedAgent === null) {
            $this->set('__user_agent', $userAgent);
        } else {
            if ($savedAgent !== $userAgent) {
                // Возможная попытка угона сессии или смены контекста
                Yii::warning("Session verification failed for ID: " . $this->getId() . 
                    ". Expected AGENT: $savedAgent, GOT: $userAgent.", 'security');
                $this->destroy();
                
                $response = Yii::$app->getResponse();
                if ($response) {
                    $response->redirect(Yii::$app->getUser()->loginUrl)->send();
                }
                Yii::$app->end();
            }
        }

        // Если пользователь авторизован, привязываем его ID и ограничиваем сессии при каждой проверке
        if (!Yii::$app->getUser()->getIsGuest()) {
            $userId = Yii::$app->getUser()->getId();
            
            // Важно: Yii сохраняет ID пользователя в сессии под ключом __id (по умолчанию)
            // Мы также дублируем его в __user_id для нашего поиска, если его там нет
            if ($this->get('__user_id') === null) {
                $this->set('__user_id', $userId);
            }
            
            // Перед проверкой лимита принудительно сохраняем текущую сессию, 
            // чтобы она была на диске и мы могли корректно считать ВСЕ сессии.
            // Но PHP не позволяет легко записать сессию и продолжить работу с ней как с открытой.
            // Поэтому мы будем полагаться на то, что текущая сессия УЖЕ ЕСТЬ в списке $userSessions,
            // либо мы её учитываем как +1.
            
            $this->limitUserSessions($userId, 3);
        }
    }

    /**
     * Подсчитывает количество активных сессий для данного пользователя
     */
    public function countUserSessions($userId)
    {
        $count = 0;
        $path = Yii::getAlias($this->savePath);
        if (!is_dir($path)) return 0;

        $files = scandir($path);
        foreach ($files as $file) {
            if ($file == '.' || $file == '..') continue;
            
            $filePath = $path . DIRECTORY_SEPARATOR . $file;
            if (is_file($filePath) && (time() - filemtime($filePath) < $this->getTimeout())) {
                $content = file_get_contents($filePath);
                // Сессии Yii в файлах обычно сериализованы особым образом.
                // Ищем вхождение __user_id|i:USER_ID; или __user_id|s:LENGTH:"USER_ID";
                if (strpos($content, '__user_id|i:' . $userId . ';') !== false || 
                    strpos($content, '__user_id|s:' . strlen($userId) . ':"' . $userId . '";') !== false) {
                    $count++;
                }
            }
        }
        return $count;
    }

    /**
     * Удаляет старейшие сессии пользователя, если превышен лимит
     */
    public function limitUserSessions($userId, $limit = 3)
    {
        $path = Yii::getAlias($this->savePath);
        if (!is_dir($path)) return;

        $currentSessionId = $this->getId();
        $userSessions = [];
        $files = scandir($path);
        $timeout = $this->getTimeout();
        $now = time();

        $searchPatterns = [
            '__user_id|i:' . $userId . ';',
            '__user_id|s:' . strlen((string)$userId) . ':"' . $userId . '";',
            '__id|i:' . $userId . ';',
            '__id|s:' . strlen((string)$userId) . ':"' . $userId . '";',
            '__authKey|s:32:', // Если в файле есть __authKey, это почти наверняка авторизованная сессия Yii
        ];

        Yii::info("Checking limit for user $userId. Path: $path, Limit: $limit", 'security');

        foreach ($files as $file) {
            if ($file == '.' || $file == '..' || $file == 'sess_' . $currentSessionId) continue;
            
            $filePath = $path . DIRECTORY_SEPARATOR . $file;
            if (is_file($filePath)) {
                // Игнорируем истекшие сессии
                if ($now - filemtime($filePath) >= $timeout) {
                    continue;
                }

                $content = @file_get_contents($filePath);
                if ($content === false) {
                    Yii::warning("Could not read session file: $filePath", 'security');
                    continue;
                }

                $found = false;
                // Сначала ищем жесткую привязку к ID
                foreach ($searchPatterns as $index => $pattern) {
                    if (strpos($content, $pattern) !== false) {
                        // Если мы нашли __authKey, но не нашли ID пользователя, 
                        // нам нужно убедиться, что это именно ТОТ пользователь.
                        // В текущей системе все пользователи используют один и тот же authKey? 
                        // Нет, в LoginViewModel генерируется случайный.
                        
                        if ($pattern === '__authKey|s:32:') {
                            // Если мы нашли authKey, проверим, есть ли там ID этого пользователя
                            if (strpos($content, '__id|i:' . $userId . ';') !== false || 
                                strpos($content, '__id|s:' . strlen((string)$userId) . ':"' . $userId . '";') !== false) {
                                $userSessions[$filePath] = filemtime($filePath);
                                $found = true;
                            }
                        } else {
                            $userSessions[$filePath] = filemtime($filePath);
                            $found = true;
                        }
                        
                        if ($found) break;
                    }
                }
                
                if ($found) {
                    Yii::info("Found session for user $userId: $file", 'security');
                }
            }
        }

        // Количество сессий на диске ПЛЮС текущая сессия (которая может быть еще не записана на диск)
        $totalSessionsCount = count($userSessions) + 1;
        Yii::info("Total sessions count (including current): $totalSessionsCount. Limit: $limit", 'security');

        if ($totalSessionsCount > $limit) {
            asort($userSessions); // Сортируем по времени изменения (старые в начале)
            $toDelete = $totalSessionsCount - $limit;
            Yii::info("Exceeded limit. Deleting $toDelete oldest session(s).", 'security');
            foreach ($userSessions as $filePath => $mtime) {
                if ($toDelete <= 0) break;
                if (@unlink($filePath)) {
                    Yii::info("Deleted session file: $filePath", 'security');
                } else {
                    Yii::error("Failed to delete session file: $filePath. Error: " . error_get_last()['message'], 'security');
                }
                $toDelete--;
            }
        }
    }
}
