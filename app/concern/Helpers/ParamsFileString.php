<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 10/12/19
 * Time: 02:36
 */

namespace App\concern\Helpers;


class ParamsFileString
{
    /**
     * @param string $path
     * @return string
     */
    public function ConvertFilePublic(string $path)
    {
        $newPath = explode('images/event', $path);
        return public_path() . DIRECTORY_SEPARATOR . 'images/event' . $newPath[1];
    }
}
