<?

/*
 * Developed by Urmuz Tagizade
 * © GT Solutions
*/

namespace common\components\mail;

class Obfuscator
{

    private function getObfuscatedEmailAddress($email)
    {
        $alwaysEncode = ['.', ':', '@'];
        $result = '';
        for ($i = 0; $i < strlen($email); $i++) {
            if (in_array($email[$i], $alwaysEncode) || mt_rand(1, 100) < 25) {
                if (mt_rand(0, 1)) {
                    $result .= '&#' . ord($email[$i]) . ';';
                } else {
                    $result .= '&#x' . dechex(ord($email[$i])) . ';';
                }
            } else {
                $result .= $email[$i];
            }
        }

        return $result;
    }

    public function getObfuscatedEmailLink($email, $params = [])
    {
        if (!is_array($params)) {
            $params = [];
        }

        if (!isset($params['rel'])) {
            $params['rel'] = 'nofollow';
        }

        $neverEncode = ['.', '@', '+'];

        $urlEncodedEmail = '';
        for ($i = 0; $i < strlen($email); $i++) {
            if (!in_array($email[$i], $neverEncode) && mt_rand(1, 100) < 25) {
                $charCode = ord($email[$i]);
                $urlEncodedEmail .= '%';
                $urlEncodedEmail .= dechex(($charCode >> 4) & 0xF);
                $urlEncodedEmail .= dechex($charCode & 0xF);
            } else {
                $urlEncodedEmail .= $email[$i];
            }
        }

        $obfuscatedEmail = $this->getObfuscatedEmailAddress($email);
        $obfuscatedEmailUrl = $this->getObfuscatedEmailAddress('mailto:' . $urlEncodedEmail);

        $link = '<a class="mail" href="' . $obfuscatedEmailUrl . '"';
        foreach ($params as $param => $value) {
            $link .= ' ' . $param . '="' . htmlspecialchars($value) . '"';
        }
        $link .= '>' . $obfuscatedEmail . '</a>';

        return $link;
    }

}