<?php

namespace App;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class Comment extends Model
{
    protected $fillable = ['content', 'event_id', 'user_id', 'reply_id', 'likes'];

    /**
     * @param array|object $dataComments
     * @return array
     */
    public static function settingsData($dataComments)
    {
        $data = [];
        if (!empty($dataComments)) {
            foreach ($dataComments as $comment) {
                $setting = Setting::select('id', 'image_user')
                    ->where('user_id', $comment->user_id)
                    ->first();

                $data[$comment->id]['comment'] = $comment;
                $data[$comment->id]['setting'] = $setting;
            }
        }

        return $data;
    }

    /**
     * @param array $comments
     * @return array
     */
    public static function withReply(array $comments): array
    {
        $dataComment = [];

        if (!empty($comments)) {
            foreach ($comments as $comment) {
                // Recuperate the attributes comment and setting to the arrays comments !!!
                $setting = $comment['setting'];
                $comment = $comment['comment'];

                // If a reply is found, a array reply is added !!!
                if ($comment->reply_id !== null) {
                    $reply = Comment::settingsData(Comment::where('reply_id', (int)$comment->reply_id)
                        ->with('user:id,name')
                        ->get());
                    $dataComment[$comment->reply_id]['comment']['reply'] = $reply;
                } else {
                    // We injected the comment and setting by comment id !!!
                    $dataComment[$comment->id]['comment'] = $comment;
                    $dataComment[$comment->id]['setting'] = $setting;

                    $dataComment[$comment->id]['comment']['reply'] = [];
                }
            }
        }
        return $dataComment;
    }

    /**
     * Add like in the comment and we update the comment
     * @param int|null $commentID
     */
    public static function addLike(?int $commentID)
    {
        $comment = Comment::find($commentID);
        $likes = $comment->likes;

        if (is_null($likes)) {
            $likes = 0;
        }
        $comment->likes = $likes + 1;
        $comment->save();
    }

    /**
     * Remove like in the comment and we update the comment
     * @param int|null $commentID
     */
    public static function removeLike(?int $commentID)
    {
        $comment = Comment::find($commentID);
        $likes = $comment->likes;

        if (is_null($likes)) {
            $likes = 0;
        }
        $comment->likes = $likes - 1;
        $comment->save();
    }

    /**
     * @param array|object $comments
     * @param bool $mountPaginate
     * @return array
     */
    public static function allWithReply($comments, bool $mountPaginate = true)
    {
        $dataRepliesComments = [];

        foreach ($comments as $comment) {
            $dataRepliesComments['data'][$comment->id] = $comment;
            if (!is_null($comment->reply_id)) {
                $commentReply = Comment::where('id', (int)$comment->reply_id)->first();
                $userReply = User::find($commentReply->user_id);
                $dataRepliesComments['data'][$comment->id]['nameReply'] = $userReply['name'];
            }
        }

        if ($mountPaginate) {
            // Pagination Element (perPage and countPage) !!!
            $dataRepliesComments['perPage'] = $comments->perPage();
            $dataRepliesComments['countPage'] = $comments->lastPage();
        }

        return $dataRepliesComments;
    }

    /**
     * @param $query
     * @param $eventID
     * @return mixed
     */
    public function scopeAllByEvent($query, $eventID)
    {
        return $query->where('event_id', $eventID)->with('user:id,name');
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
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function like_comments()
    {
        return $this->hasMany(LikeComment::class);
    }
}
