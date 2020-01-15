<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Planning extends Model
{
    protected $fillable = ['id', 'title', 'user_id', 'date_activity'];

    public $timestamps = true;

    /**
     * @param string $activity
     * @param \DateTime|string $date
     * @param int $userId
     * @return void
     */
    public static function createPlanning(string $activity, $date, int $userId)
    {
        self::create([
            'title' => $activity,
            'date_activity' => $date,
            'user_id' => $userId
        ]);
    }

    /**
     * @param $query
     * @param int $userId
     * @return mixed
     */
    public function scopeFindLastByUserId($query, int $userId)
    {
        return $query->select('id', 'title', 'date_activity')
            ->where('user_id', (int)$userId)
            ->orderByDesc('id')
            ->limit(1);
    }
}
