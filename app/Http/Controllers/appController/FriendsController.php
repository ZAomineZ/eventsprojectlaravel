<?php
namespace App\Http\Controllers\appController;

use App\concern\Helpers\PaginationHelper;
use App\concern\Secure\FriendValid;
use App\Event;
use App\Friend;
use App\Http\Controllers\Controller;
use App\JoinEvent;
use App\Notifications\AddFriendInvitationNotification;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendsController extends Controller
{
    /**
     * @param Request $request
     * @param string $username
     * @return JsonResponse
     */
    public function addFriend(Request $request, string $username): JsonResponse
    {
        $userTo = User::where('name', $username)->first();
        $userFrom = $request->all()['params']['user'] ?? null;

        if ($userTo && !is_null($userFrom)) {
            $friend = Friend::findFriend($userTo->id, $userFrom['user']['id'])->first();

            if (!$friend) {
                Friend::createFriend($userTo->id, $userFrom['user']['id']);

                // Recuperate UserFrom Model
                $userFromModel = User::find((int)$userFrom['user']['id']);
                $userTo->notify(new AddFriendInvitationNotification($userFromModel));

                return response()->json([
                    'success' => true,
                    'message' => 'You are enjoyed a request to ' . $userTo->name . ' !!!',
                    'data' => [
                        'friendRequest' => Friend::findFriend($userTo->id, $userFrom['user']['id'])->first()
                    ]
                ], 201);
            }

            return $this->badRequestResponse('You are already enjoyed a request to this user !!!');
        }

        return $this->badRequestResponse('You must to connect for enjoyed a resquest to this user !!!');
    }

    /**
     * @param Request $request
     * @param string $username
     * @return JsonResponse
     */
    public function removeFriend(Request $request, string $username): JsonResponse
    {
        $userTo = User::where('name', $username)->first();
        $userFrom = $request->all()['params']['user'] ?? null;

        if ($userTo && !is_null($userFrom)) {
            $friend = Friend::findFriend($userTo->id, $userFrom['user']['id'])->first();

            if ($friend) {
                $friend->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'You are remove ' . $userTo->name . ' to your list friends !!!',
                    'data' => [
                        'friendRequest' => null
                    ]
                ], 201);
            }

            return $this->badRequestResponse('Action not valid !!!');
        }

        return $this->badRequestResponse('You must to connect for enjoyed a resquest to this user !!!');
    }

    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function indexFriends(string $authToken)
    {
        $userAuth = User::findByAuthToken($authToken)->first();

        if ($userAuth) {
            $friends = Friend::getUserFriend($userAuth->id)
                ->where('type_friend', 1)
                ->paginate(9);

            return response()->json([
                'success' => true,
                'data' => [
                    'friends' => Friend::allFriends($friends)
                ]
            ], 200);
        }
    }

    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function myFriends(string $authToken): JsonResponse
    {
        $user = User::FindByAuthToken($authToken)->first();

        if (!$user) {
            $this->badRequestResponse('You must to connect for to accessed to this paeg !!!');
        }

        // We go recuperate all Events friends, Events Join and Events Live to User !!!
        $eventsFriends = Event::join('friends', 'events.user_id', '=', 'friends.to_user_id')
            ->with('images')
            ->with('category')
            ->with('user:id,name')
            ->where('friends.from_user_id', (int)$user->id)
            ->paginate(12, 'events.*');

        $eventsFriendsActive = Event::join('friends', 'events.user_id', '=', 'friends.to_user_id')
            ->with('images')
            ->with('category')
            ->with('user:id,name')
            ->where('friends.from_user_id', (int)$user->id)
            ->where('events.date_event', '>', date('Y-m-d H:i:s'))
            ->paginate(12, 'events.*');

        $eventsJoinFriends = JoinEvent::join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
            ->with('event:id,title,slug,date_event,category_id,users_max,content')
            ->with('user:id,name')
            ->where('friends.from_user_id', (int)$user->id)
            ->where('join_events.type_event', 1)
            ->paginate(5, 'join_events.*');

        $eventsJoinFriendsActive = JoinEvent::join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
            ->join('events', 'join_events.event_id', '=', 'events.id')
            ->with('user:id,name')
            ->where('friends.from_user_id', (int)$user->id)
            ->where('join_events.type_event', 1)
            ->where('events.date_event', '>', date('Y-m-d H:i:s'))
            ->paginate(5, 'join_events.*');

        return response()->json([
            'success' => true,
            'data' => [
                'eventsFriends' => Event::eventsFriends($eventsFriends),
                'eventsFriendsActive' => Event::eventsFriends($eventsFriendsActive),
                'eventsJoinFriends' => Event::friendsEventWithImages($eventsJoinFriends),
                'eventsJoinFriendsActive' => Event::friendsEventWithImages($eventsJoinFriendsActive)
            ]
        ]);
    }

    /**
     * Recuperate all Friends to $username User !!!
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function allFriendsByUsername(string $username, string $authToken): JsonResponse
    {
        $userFound = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        // Verif if the two users are friend !!!
        FriendValid::existFriend($userAuth->id, $userFound->id);

        if ($userFound) {
            if ($userAuth) {
                $friends = Friend::getUserFriend($userFound->id)
                    ->orderBy('created_at', 'DESC')
                    ->where('type_friend', 1)
                    ->paginate(9);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'friends' => Friend::allFriends($friends, $userAuth->id),
                        'username' => $userFound->name
                    ]
                ]);
            }
            return $this->badRequestResponse('You must to be connect for accessed to this page !!!');
        }

        return $this->badRequestResponse('This Username don\'t exist or not valid !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationFriends(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'attributes' => [
                    'from_user_id' => $user->id,
                    'type_friend' => 1
                ],
                'images' => false,
                'user' => false,
                'category' => false,
                'toUser' => true
            ];

            $friendsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Friend', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'friends' => Friend::allFriends($friendsPaginate, null, false)
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationEventsFriends(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;
        $active = $request->all()['params']['active'] ?? false;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'attributes' => [
                    'friends.from_user_id' => (int)$user->id,
                ],
                'join' => [
                    'table' => 'friends',
                    'fromJoin' => 'events.user_id',
                    'toJoin' => 'friends.to_user_id'
                ],
                'get' => [
                  'events.*'
                ],
                'images' => true,
                'user' => true,
                'category' => true,
                'toUser' => false
            ];

            if ($active) {
                $options['attributes']['events.date_event'] = '>' . date('Y-m-d H:i:s');
            }

            $eventsFriendsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Event', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'eventsFriends' => Event::eventsFriends($eventsFriendsPaginate, false)
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationEventsJoinFriends(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;
        $active = $request->all()['params']['active'] ?? false;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'attributes' => [
                    'friends.from_user_id' => (int)$user->id,
                    'join_events.type_event' => 1
                ],
                'join' => [
                    'table' => 'friends',
                    'fromJoin' => 'join_events.user_id',
                    'toJoin' => 'friends.to_user_id'
                ],
                'joinTwo' => [
                    'table' => 'events',
                    'fromJoin' => 'join_events.event_id',
                    'toJoin' => 'events.id'
                ],
                'get' => [
                   'join_events.*'
                ],
                'images' => false,
                'user' => true,
                'category' => false,
                'toUser' => false,
                'events' => true
            ];

            if ($active) {
                $options['attributesSyntax']['name'] = 'events.date_event';
                $options['attributesSyntax']['sign'] = '>';
                $options['attributesSyntax']['value'] = date('Y-m-d H:i:s');
            }

            $eventsJoinFriendsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\JoinEvent', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'eventsJoinFriends' => Event::friendsEventWithImages($eventsJoinFriendsPaginate, false)
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @param string $username
     * @return JsonResponse
     */
    public function paginationFriendsAllByUsername(Request $request, string $username): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $userAuth = User::FindByAuthToken($authToken)->first();
        $userFound = User::where('name', $username)->first();

        if ($userAuth) {
            $options = [
                'attributes' => [
                    'from_user_id' => (int)$userFound->id,
                    'type_friend' => 1
                ],
                'orderBy' => 'created_at',
                'images' => false,
                'user' => false,
                'category' => false,
                'toUser' => true,
                'events' => false
            ];

            $friendsAll = PaginationHelper::pagination($selectedPage, $perPage, 'App\Friend', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'friends' => Friend::allFriends($friendsAll, $userAuth->id, false)
                ]
            ]);
        }
    }

    /**
     * @param string $message
     * @return JsonResponse
     */
    private function badRequestResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], 201);
    }
}
