<?php

namespace App;

use App\concern\Helpers\ArrayHelpers;
use App\Notifications\InviteFriendNotification;
use Illuminate\Database\Eloquent\Model;

class Friend extends Model
{

    protected $fillable = ['to_user_id', 'from_user_id', 'type_friend'];

    public $timestamps = true;

    /**
     * This Method allows to create a request Friend in the database with $toUserId and $fromUserId !!!
     * @param int|null $toUserId
     * @param int|null $fromUserId
     * @return mixed
     */
    public static function createFriend(?int $toUserId, ?int $fromUserId)
    {
        return self::create([
            'to_user_id' => (int)$toUserId,
            'from_user_id' => (int)$fromUserId,
            'type_friend' => 0
        ]);
    }

    /**
     * @param array|object $friends
     * @param int|null $authConnectId
     * @param bool $mountPaginate
     * @return array
     */
    public static function allFriends($friends, ?int $authConnectId = null, bool $mountPaginate = true)
    {
        $dataFriends = [];
        $dataMeFriends = [];

       foreach ($friends as $key => $friend) {
           $dataFriends['data'][$key + 1]['id'] = $friend->id;
           $dataFriends['data'][$key + 1]['created'] = $friend->created_at;
           $dataFriends['data'][$key + 1]['userId'] = $friend->toUser->id;
           $dataFriends['data'][$key + 1]['username'] = $friend->toUser->name;

           // Search Setting to User friend
           $setting = Setting::where('user_id', (int)$friend->toUser->id)->first();

           if ($setting) {
               // If setting found, we created two key in the array activity and image to User !!!
               $dataFriends['data'][$key + 1]['setting']['activity'] = $setting->activity ?? null;
               $dataFriends['data'][$key + 1]['setting']['imageUser'] = $setting->image_user ?? null;
           } else {
               $dataFriends['data'][$key + 1]['setting'] = [];
           }
       }

        if ($mountPaginate) {
            // Pagination Element (perPage and countPage) !!!
            $dataFriends['perPage'] = $friends->perPage();
            $dataFriends['countPage'] = $friends->lastPage();
        }

        if (is_int($authConnectId) && !is_null($authConnectId)) {
            // Search friends to User Auth, if exist !!!
            $friends = Friend::getUserFriend($authConnectId)->get();

            foreach ($friends as $key => $friend) {
                // If $authConnectId is defined, we created two key in the array for the friends to User Auth !!!
                $dataMeFriends['data'][$key + 1]['id'] = $friend->id;
                $dataMeFriends['data'][$key + 1]['userId'] = $friend->to_user_id;
                $dataMeFriends['data'][$key + 1]['type_friend'] = $friend->type_friend;
            }

            $arrayHelpers = new ArrayHelpers();
            return $arrayHelpers->similarArray($dataFriends, $dataMeFriends, 'userId', 'meFriend', 'type_friend', 'UNIQ');
        }

       return $dataFriends;
    }

    /**
     * @param $friendsParticipated
     * @return int
     */
    public static function countParticipated($friendsParticipated): int
    {
        $friends = [];
        foreach ($friendsParticipated as $key => $value) {
            $friends[] = $value->user_id;
        }

        $newDataFriends = array_unique($friends);
        $countParticipated = count($newDataFriends);

        return $countParticipated;
    }

    /**
     * @param array $friends
     * @param User $userAuth
     * @param Event $event
     */
    public static function invitedFriends(array $friends, User $userAuth, Event $event)
    {
        if (!empty($friends)) {
            foreach ($friends as $key => $value) {
                $user = User::find((int)$value);

                if ($user) {
                    JoinEvent::create([
                        'type_event' => 2,
                        'event_id' => $event->id,
                        'user_id' => $user->id
                    ]);

                    $user->notify(new InviteFriendNotification($userAuth, $event));
                }
            }
        }
    }

    /**
     * @param $query
     * @param int|null $toUserId
     * @param int|null $fromUserId
     * @return mixed
     */
    public function scopeFindFriend($query, ?int $toUserId, ?int $fromUserId)
    {
        return $query
            ->select('id', 'type_friend')
            ->where('to_user_id', (int)$toUserId)
            ->where('from_user_id', (int)$fromUserId);
    }

    /**
     * @param $query
     * @param int $fromUserId
     * @return mixed
     */
    public function scopeGetUserFriend($query, int $fromUserId)
    {
        return $query
            ->with('toUser:id,name')
            ->where('from_user_id', (int)$fromUserId);
    }

    public function fromUser()
    {

    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function toUser()
    {
        return $this->belongsTo(User::class);
    }
}
