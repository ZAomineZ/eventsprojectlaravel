<?php

namespace App\Http\Controllers;

use App\Comment;
use App\Event;
use App\Friend;
use App\JoinEvent;
use App\Notification;
use App\Setting;
use App\User;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function index(string $authToken): JsonResponse
    {
        $user = User::FindByAuthToken($authToken)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'This User isn\'t valid or someone is already logged into this account !!!'
            ]);
        }

        $setting = Setting::select('id', 'image_user')
            ->where('user_id', (int)$user->id)
            ->first();

        $friends = Friend::getUserFriend($user->id)
            ->where('type_friend', 1)
            ->limit(4)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'setting' => $setting ?? null,
                'countMeEvents' => Event::where('user_id', (int)$user->id)->count(),
                'countEventsJoin' => Event::joinCount((int)$user->id)->count(),
                'friends' => Friend::where('from_user_id', (int)$user->id)
                    ->where('type_friend', 1)
                    ->count(),
                'friendsList' => Friend::allFriends($friends, null, false)
            ]
        ]);
    }

    /**
     * @param int|string|null $userID
     * @return JsonResponse
     */
    public function home($userID): JsonResponse
    {
        $user = User::find($userID);

        if ($user) {
            $events = Event::count();
            $me_events = Event::where('user_id', (int)$user->id)->count();
            $me_comments = Comment::where('user_id', (int)$user->id)->count();
            $me_activities = Notification::where('notifiable_id', (int)$user->id)->count();

            $countJoinEvents = Event::joinCount($user->id)->count();
            $countJoinEventsActive = Event::joinCount($user->id, true)->count();

            $friends = Friend::where('from_user_id', (int)$user->id)
                ->where('type_friend', 1)
                ->count();

            $eventsFriendsCount = Event::getCountFriendsEvent($user->id)->count();
            $eventsFriendsActiveCount = Event::getCountFriendsEvent($user->id, true)->count();

            $eventsFriendsJoinCount = JoinEvent::getCountFriendsJoinActive($user->id)->count();
            $eventsFriendsJoinActiveCount = JoinEvent::getCountFriendsJoinActive($user->id, true)->count();

            $usersCount = User::count();
            $usersActiveCount = User::activeUsers()->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $events,
                    'me_events' => $me_events,
                    'me_comments' => $me_comments,
                    'me_activities' => $me_activities,
                    'join_events' => $countJoinEvents,
                    'active_join_events' => $countJoinEventsActive,
                    'friendsCount' => $friends,
                    'eventsFriendsCount' => $eventsFriendsCount,
                    'eventsFriendsJoinCount' => $eventsFriendsJoinCount,
                    'eventsFriendsActiveCount' => $eventsFriendsActiveCount,
                    'eventsFriendsJoinActiveCount' => $eventsFriendsJoinActiveCount,
                    'usersCount' => $usersCount,
                    'usersActiveCount' => $usersActiveCount
                ]
            ], 201);
        }
    }
}
