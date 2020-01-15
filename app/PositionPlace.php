<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PositionPlace extends Model
{
    public $timestamps = true;

    protected $fillable = ['position', 'viewport', 'event_id'];

    /**
     * @param $query
     * @param int $eventId
     * @return mixed
     */
    public function scopeFindByEvent($query, int $eventId)
    {
        return $query->select('position', 'viewport')->where('event_id', (int)$eventId);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function events()
    {
        return $this->belongsTo(Event::class);
    }
}
