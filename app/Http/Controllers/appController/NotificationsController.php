<?php
namespace App\Http\Controllers\appController;

use App\concern\Helpers\PaginationHelper;
use App\Event;
use App\Http\Controllers\Controller;
use App\JoinEvent;
use App\Notification;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function index(string $authToken): JsonResponse
    {
        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $notifications = Notification::where('notifiable_id', (int)$user->id)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();

            $notificationsNoCheck = Notification::where('notifiable_id', (int)$user->id)
                ->whereNull('read_at')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'notificationsNoCheck' => $notificationsNoCheck
                ]
            ]);
        }

        return $this->badResponseRequest('You must to be connect for accessed to this page !!!');
    }

    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function indexAll(string $authToken): JsonResponse
    {
        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $notifications = Notification::where('notifiable_id', (int)$user->id)
                ->orderByDesc('created_at')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => Notification::notificationsAll($notifications)
                ]
            ]);
        }

        return $this->badResponseRequest('You must to be connect for accessed to this page !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse|bool
     */
    public function checkNotifications(Request $request)
    {
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            // Check all notification to User !!!
            foreach ($user->unreadNotifications as $notification) {
                $notification->markAsRead();
            }

            return response()->json([
                'success' => true
            ], 200);
        }

        return $this->badResponseRequest('You must to be connect for accessed to this page !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     * @throws \Exception
     */
    public function invitationEvent(Request $request): JsonResponse
    {
        $authToken = $request->all()['params']['authToken'] ?? null;
        $eventID = $request->all()['params']['eventId'] ?? null;
        $type = $request->all()['params']['type'] ?? 'accept';
        $notificationID = $request->all()['params']['notificationID'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $joinEvent = JoinEvent::where('type_event', 2)
                ->where('event_id', (int)$eventID)
                ->where('user_id', (int)$user->id)
                ->first();

            if ($joinEvent) {
                return Notification::invitationEvent($type, $joinEvent, $user, $notificationID);
            }

            return $this->badResponseRequest('You can\'t accept or decline a invitation don\'t exit !!!');
        }

        return $this->badResponseRequest('You must to be connect for accessed to this page !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function invitationFriend(Request $request)
    {
        $authToken = $request->all()['params']['authToken'] ?? null;
        $userID = $request->all()['params']['userID'] ?? null;
        $type = $request->all()['params']['type'] ?? 'accept';
        $notificationID = $request->all()['params']['notificationID'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $userRequest = User::find((int)$userID);

            if ($userRequest) {
                return Notification::invitationUser($type, $userRequest, $user, $notificationID);
            }

            return $this->badResponseRequest('You can\'t accept or decline a invitation to User don\'t exit !!!');
        }

        return $this->badResponseRequest('You must to be connect for accessed to this page !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function requestEventJoin(Request $request)
    {
        $authToken = $request->all()['params']['authToken'] ?? null;
        $userID = $request->all()['params']['userID'] ?? null;
        $eventID = $request->all()['params']['eventID'] ?? null;
        $type = $request->all()['params']['type'] ?? 'accept';
        $notificationID = $request->all()['params']['notificationID'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $userRequest = User::find((int)$userID);
            $eventRequest = Event::find((int)$eventID);

            if ($userRequest && $eventRequest) {
                return Notification::joinEventRequest($userRequest, $user, $eventRequest, $type, $notificationID);
            }

            return $this->badResponseRequest('You can\'t accept or decline a invitation to User or Event don\'t exit !!!');
        }

        return $this->badResponseRequest('You must to be connect for accessed to this page !!!');
    }

    public function paginateNotifications(Request $request)
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'attributes' => [
                    'notifiable_id' => (int)$user->id
                ],
                'orderBy' => 'created_at',
                'images' => false,
                'user' => false,
                'category' => false
            ];

            $notificationsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Notification', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notificationsPaginate
                ]
            ]);
        }
    }

    /**
     * @param string $message
     * @return JsonResponse
     */
    private function badResponseRequest (string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ]);
    }
}
