<?php

namespace visitor\providers;

use yii\httpclient\Client;

class ApiDataProvider
{
    public function fetchData($apiUrl)
    {
        $client = new Client();
        $response = $client->createRequest()
            ->setMethod('GET')
            ->setFormat(Client::FORMAT_JSON)
            ->addHeaders(['content-type' => 'application/json'])
            ->setUrl($apiUrl)
            ->send();

        return json_decode($response->getContent(), true);
    }


    public function downloadFile($apiUrl)
    {
        $client = new Client();
        $response = $client->createRequest()
            ->setMethod('GET')
            ->setFormat(Client::FORMAT_JSON)
            ->setUrl($apiUrl)
            ->send();

        return $response->getContent();
    }

}