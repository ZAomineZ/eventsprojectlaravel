<?php

namespace App;

use App\Notifications\InfoRequestJoinEventNotification;
use App\Notifications\InfoRequestNotification;
use App\Notifications\RequestJoinEventNotification;
use Illuminate\Database\Eloquent\Model;

class JoinEvent extends Model
{
    protected $fillable = ['type_event', 'event_id', 'user_id'];

    public $timestamps = true;

    /**
     * @param int|string|null $eventID
     * @return array
     */
    public static function usersFind($eventID = null)
    {
        $data = [];

        $joinEvents = self::with('user')
            ->where('event_id', (int)$eventID)
            ->where('type_event', 1)
            ->get();

        foreach ($joinEvents as $key => $joinEvent) {
            $data[$key]['id'] = $key + 1;
            $data[$key]['username'] = $joinEvent->user->name ?? '';

            // If Setting to userID found, we add the setting key in the array DATA !!!
            $setting = Setting::select('image_user')
                ->where('user_id', (int)$joinEvent->user_id)
                ->first();

            if ($setting) {
                $data[$key]['image_user'] = $setting->image_user;
            }
        }

        return $data;
    }

    /**
     * @param string $typeEvent
     * @param int $eventID
     * @param array $user
     */
    public static function joinRequest(string $typeEvent, int $eventID, array $user)
    {
        // User Auth !!!
        $event = Event::find((int)$eventID);
        $userAuth = User::find((int)$user['user']['id']);
        $userEvent = User::find((int)$event->user_id);

        if ($typeEvent === 'private') {
            JoinEvent::create([
                'type_event' => 0,
                'event_id' => (int)$eventID,
                'user_id' => (int)$user['user']['id']
            ]);

            // Notification add Request for Join the Event !!!
            $userAuth->notify(new RequestJoinEventNotification($event));

            // Notification Info for User to Event
            $dataNotif = 'You have received a request to ' . $userAuth->name . ' for join your event "' . $event->title . '" !!!';
            $userEvent->notify(new InfoRequestJoinEventNotification($dataNotif, $userAuth, $event));
        } else {
            JoinEvent::create([
                'type_event' => 1,
                'event_id' => (int)$eventID,
                'user_id' => (int)$user['user']['id']
            ]);

            $dataNotif = $userAuth->name . ' has join your Event "' . $event->title . '" !!!';
            $userEvent->notify(new InfoRequestNotification($dataNotif, $userAuth, $event));

            // Send Notification for all this friends !!!
            Notification::sendNotificationEvent((int)$user['user']['id'], $event, 'join');
        }
    }

    /**
     * @param $query
     * @param int|string $userID
     * @param int|string $eventID
     * @return mixed
     */
    public function scopeFindJoin($query, $userID, $eventID)
    {
        return $query->select('id', 'type_event')
            ->where('event_id', (int)$eventID)
            ->where('user_id', (int)$userID);
    }

    /**
     * @param $query
     * @param $userID
     * @param bool $active
     * @return mixed
     */
    public function scopeGetCountFriendsJoinActive($query, $userID, bool $active = false)
    {
        if (!$active) {
            return $query->join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
                ->where('friends.from_user_id', (int)$userID)
                ->where('join_events.type_event', 1);
        }

        return $query->join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
            ->join('events',  'join_events.event_id', '=', 'events.id')
            ->where('friends.from_user_id', (int)$userID)
            ->where('join_events.type_event', 1)
            ->where('events.date_event', '>', date('Y-m-d H:i:s'));
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
}
