<?php
namespace App\concern\Helpers;

class DateHelpers
{
    /**
     * @param \DateTime|string $date
     * @param \DateTime|string $hour
     * @return string
     */
    public static function dateFormatWithHour($date, $hour)
    {
       $date = date('Y-m-d', strtotime($date));
       $hour = date('H:i:s', strtotime($hour));

       $dateAndHour = $date . " " . $hour;

       return $dateAndHour;
    }

    /**
     * @param string|\DateTime $date
     * @param string $intervalValue
     * @return \DateTime|string
     * @throws \Exception
     */
    public static function dateFormatAddTime($date, string $intervalValue)
    {
        $date = new \DateTime($date);
        $date->add(new \DateInterval($intervalValue));
        return $date->format('Y-m-d H:i:s');
    }

    /**
     * @param string $date
     * @param string $format
     * @return false|string
     */
    public static function formatDateTypeString(string $date, string $format)
    {
        $date = date($format, strtotime($date));
        return $date;
    }
}
