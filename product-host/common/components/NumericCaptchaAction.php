<?php

namespace common\components;

use yii\captcha\CaptchaAction;

class NumericCaptchaAction extends CaptchaAction
{
    /**
     * Генерирует код капчи, состоящий только из цифр.
     * @return string
     */
    protected function generateVerifyCode()
    {
        if ($this->minLength < 3) {
            $this->minLength = 3;
        }
        if ($this->maxLength > 20) {
            $this->maxLength = 20;
        }
        if ($this->minLength > $this->maxLength) {
            $this->maxLength = $this->minLength;
        }

        $length = mt_rand($this->minLength, $this->maxLength);
        
        $digits = '0123456789';
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $digits[mt_rand(0, 9)];
        }
        
        return $code;
    }
}
