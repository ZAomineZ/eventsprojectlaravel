<?php
namespace App\concern\Helpers;

class FileParamsHelper
{

    /**
     * @param string $file
     * @return string
     * Replace "." by "/" for recuperate the token ($file) !!!
     */
    public static function TokenImgExplode (string $file) : string
    {
        $explode = explode('/', $file);
        $explode_domain = explode('-', $explode[count($explode) - 1]);
        $explode_token = explode('.', $explode_domain[count($explode_domain) - 1]);
        return $explode_token[0];
    }

    /**
     * @param string $file
     * @param $mode
     * @return bool|resource
     */
    protected static function FopenFile (string $file, $mode)
    {
        return fopen($file, $mode);
    }

    /**
     * @param $filename
     * @param $options
     * @param $length_fseek
     * @return bool|int
     * Method fseek position the pointer in the file with $length_fseek,
     * for write with fwrite() the json and his informations !!!
     */
    protected static function FWriteUpdate ($filename, $options, $length_fseek) {
        fseek($filename, $length_fseek);
        return fwrite($filename, ',' . $options . ']');
    }

    /**
     * @param string $file
     * @param string $dir
     * @param bool $string_r
     * @return mixed
     */
    public static function OpenFile (string $file, string $dir, bool $string_r = false)
    {
        chmod($dir, 0777);
        self::FopenFile($file, 'r');
        return $string_r === false ?
            \GuzzleHttp\json_decode(file_get_contents($file))
            : file_get_contents($file);
    }

    /**
     * @param string $file
     * @param string $dir
     * @param $options
     * @return bool|int
     * Update the file and recuperate the result with file_get_contents() !!!
     */
    public static function UpdateFile (string $file, string $dir, $options)
    {
        chmod($dir, 0777);
        $filename = self::FopenFile($file, 'r+');
        $file_get = file_get_contents($file);
        if ($filename) {
            return self::FWriteUpdate($filename, $options, strlen($file_get) - 1);
        }
        return false;
    }

    /**
     * @param string $file
     * @param string $dir
     * @param $options
     * @return bool|int
     */
    public static function UpdateFileExist (string $file, string $dir, $options)
    {
        chmod($dir, 0777);
        $filename = self::FopenFile($file, 'r+');
        if ($filename) {
            return fwrite($filename, $options);
        }
        return false;
    }

    /**
     * @param string $file
     * @param string $dir
     * @param $options
     * @param $json = false
     * @return bool
     * Create a file $file and open with self::FopenFile()
     */
    public static function CreateParamsFile (string $file, string $dir, $options, $json = false) : bool
    {
        chmod($dir, 0777);
        $fopen = self::FopenFile($file, "w");
        if ($options !== null) {
            if ($json && !is_array($options)) {
                return fwrite($fopen, $options);
            } elseif ($json === false && !is_array($options)) {
                return file_put_contents($file, self::FopenFile($options, "r"));
            } elseif ($json && is_array($options)) {
                return fwrite(self::FopenFile($fopen, "w+"), $options);
            }
        }
        return true;
    }
}
