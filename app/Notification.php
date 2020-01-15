<?php

namespace App;

use App\Notifications\CommentCreateNotification;
use App\Notifications\ConfirmationInvitationEventNotification;
use App\Notifications\ConfirmationInvitationFriendNotification;
use App\Notifications\ConfirmationYourInvitationFriendNotification;
use App\Notifications\EventUserNotification;
use App\Notifications\InfoRequestNotification;
use App\Notifications\LikeCommentNotification;
use App\Notifications\ReplyCommentCreateNotification;
use Illuminate\Database\Eloquent\Model;
use Mockery\Matcher\Not;

class Notification extends Model
{
    public $incrementing = false;

    public $timestamps = true;

    /**
     * @param string $type
     * @param JoinEvent $joinEvent
     * @param User $user
     * @param string $notificationID
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public static function invitationEvent(string $type, JoinEvent $joinEvent, User $user, string $notificationID)
    {
        if ($type === 'accept') {
            // Accept Join Event, we update typ_event !!!
            $joinEvent->type_event = 1;
            $joinEvent->save();
        } else {
            // Delete Join Event !!!
            $joinEvent->delete();
        }

        // New Notification send and we delete the notification invitation !!!
        $notification = Notification::where('id', $notificationID)->first();
        $notification->delete();

        // Recuperate the User to Event !!!
        $event = Event::find($joinEvent->event_id);
        $userEvent = User::find($event->user_id);

        $user->notify(new ConfirmationInvitationEventNotification($userEvent, $event, $type));

        // Lists all Notifications
        $notifications = Notification::where('notifiable_id', (int)$user->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'notification' =>  Notification::notificationsAll($notifications)
            ]
        ]);
    }

    /**
     * @param string $type
     * @param User $userRequest
     * @param User $user
     * @param string $notificationID
     * @return \Illuminate\Http\JsonResponse
     */
    public static function invitationUser(string $type, User $userRequest, User $user, string $notificationID)
    {
        $friend = Friend::FindFriend($user->id, $userRequest->id)->first();

        if (!$friend) {
            return response()->json([
                'success' => false,
                'message' => 'You can\'t accept or decline a invitation don\'t exit !!!'
            ]);
        }

        if ($type === 'accept') {
            // Accept Friend Request, we update typ_event !!!
            $friend->type_friend = 1;
            $friend->save();

            // Create Friend for User Auth !!!
            Friend::create([
               'from_user_id' => (int)$user->id,
               'to_user_id' => (int)$userRequest->id,
               'type_friend' => 1
            ]);
        } else {
            // Delete Friend Request !!!
            $friend->delete();
        }

        // New Notification send and we delete the notification invitation !!!
        $notification = Notification::where('id', $notificationID)->first();
        $notification->delete();

        // Notification confirmation request !!!
        $user->notify(new ConfirmationInvitationFriendNotification($userRequest, $type));

        // Notification message status for User Request !!!
        $userRequest->notify(new ConfirmationYourInvitationFriendNotification($user, $type));

        // Lists all Notifications
        $notifications = Notification::where('notifiable_id', (int)$user->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'notification' =>  Notification::notificationsAll($notifications)
            ]
        ]);
    }

    /**
     * @param User $userRequest
     * @param User $user
     * @param Event $eventRequest
     * @param string $type
     * @param string $notificationID
     * @return \Illuminate\Http\JsonResponse
     */
    public static function joinEventRequest(User $userRequest, User $user, Event $eventRequest, string $type, string $notificationID)
    {
        $joinEvent = JoinEvent::where('type_event', 0)
            ->where('event_id', (int)$eventRequest->id)
            ->where('user_id', (int)$userRequest->id)
            ->first();

        if ($joinEvent) {
            if ($type === 'accept') {
                // Accept Join Event, we update typ_event !!!
                $joinEvent->type_event = 1;
                $joinEvent->save();
            } else {
                // Delete Join Event !!!
                $joinEvent->delete();
            }

            // New Notification send and we delete the notification invitation !!!
            $notification = Notification::where('id', $notificationID)->first();
            $notification->delete();

            // Notifications !!!
            $dataNotif = 'You have ' . $type . ' the request to ' . $userRequest->name . ' for join the event "' . $eventRequest->title . '" !!!';
            $user->notify(new InfoRequestNotification($dataNotif));

            $dataNotifRequest = $user->name . ' has ' . $type . ' your request for join the event "' . $eventRequest->title . '" !!!';
            $userRequest->notify(new InfoRequestNotification($dataNotifRequest));

            // Lists all Notifications
            $notifications = Notification::where('notifiable_id', (int)$user->id)
                ->orderByDesc('created_at')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => [
                    'notification' =>  Notification::notificationsAll($notifications)
                ]
            ]);
        }
    }

    /**
     * @param array|object $notifications
     * @param bool $mountPaginate
     * @return array
     */
    public static function notificationsAll($notifications, $mountPaginate = true)
    {
        $newData = [];

        foreach ($notifications as $key =>  $notification) {
            $newData['data'][$key]['id'] = $notification['id'];
            $newData['data'][$key]['type'] = $notification['type'];
            $newData['data'][$key]['data'] = $notification['data'];
            $newData['data'][$key]['created_at'] = $notification['created_at'];
        }

        if ($mountPaginate) {
            // Pagination Element (perPage and countPage) !!!
            $newData['perPage'] = $notifications->perPage();
            $newData['countPage'] = $notifications->lastPage();
        }

        return $newData;
    }

    /**
     * @param int $userID
     * @param Event $event
     * @return bool
     */
    public static function sendNotificationCommentCreate(int $userID, Event $event)
    {
        $userAuth = User::find((int)$userID);
        $userEvent = User::find((int)$event->user_id);
        if ($userAuth->id !== $userEvent->id) {
            $userEvent->notify(new CommentCreateNotification($userAuth, $event));
            return true;
        }
        return false;
    }

    /**
     * @param int $replyId
     * @param int $userID
     * @param Event $event
     * @return bool
     */
    public static function sendNotificationReplyCommentCreate(int $replyId, int $userID, Event $event)
    {
        $userAuth = User::find((int)$userID);
        $commentReply = Comment::find((int)$replyId);
        if ($userAuth->id !== $commentReply->user_id) {
            $userReply = User::find((int)$commentReply->user_id);
            $userReply->notify(new ReplyCommentCreateNotification($userAuth, $event));
            return true;
        }
        return false;
    }

    /**
     * @param int $commentId
     * @param int $userId
     * @param Event $event
     * @param string $type
     * @return bool
     */
    public static function sendNotificationLikeComment(int $commentId, int $userId, Event $event, string $type)
    {
        $userComment = User::find((int)$commentId);
        $userAuth =  User::find((int)$userId);

        if ($userComment->id !== $userAuth->id) {
            $userComment->notify(new LikeCommentNotification($userAuth, $event, $type));
            return true;
        }

        return false;
    }

    /**
     * @param int $userId
     * @param Event $event
     * @param string $type
     */
    public static function sendNotificationEvent(int $userId, Event $event, string $type = 'create')
    {
        $user = User::find($userId);
        $friends = Friend::where('from_user_id', (int)$user->id)
            ->where('type_friend', 1)
            ->get();

        foreach ($friends as $friend) {
            $userFriend = User::find((int)$friend->to_user_id);
            $userFriend->notify(new EventUserNotification($user, $event, $type));
        }
    }

    /**
     * @param $query
     * @param int $userId
     * @return mixed
     */
    public function scopeLastNotification($query, int $userId)
    {
        return $query
            ->where('notifiable_id', (int)$userId)
            ->orderByDesc('created_at')
            ->limit(1);
    }
}
