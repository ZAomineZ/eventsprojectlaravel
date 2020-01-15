<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 02/12/19
 * Time: 22:56
 */

namespace App\concern\Helpers;


class FileRenderHelper
{
    /**
     * Render path PHP to String !!!
     * @param $path
     * @param array $args
     * @return false|string
     */
    public function renderPhpInString($path, array $args)
    {
        ob_start();

        include "$path";
        $var = ob_get_clean();
        ob_end_clean();

        return $var;
    }
}
