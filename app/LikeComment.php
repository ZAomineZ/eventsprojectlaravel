<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class LikeComment extends Model
{
    protected $fillable = ['comment_id', 'user_id'];

    public $timestamps = true;

    /**
     * @param int|null $userID
     * @param int|null $commentID
     */
    public static function addLikeUser(?int $userID, ?int $commentID)
    {
        self::create([
            'comment_id' => $commentID,
            'user_id' => $userID
        ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }
}
