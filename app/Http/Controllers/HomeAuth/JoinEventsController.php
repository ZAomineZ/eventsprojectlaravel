<?php

namespace App\Http\Controllers\HomeAuth;

use App\Event;
use App\Http\Controllers\Controller;
use App\JoinEvent;
use App\Notification;
use App\Notifications\LeaveEventNotification;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JoinEventsController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function join(Request $request): JsonResponse
    {
        $user = $request->all()['params']['user'] ?? null;
        $eventID = $request->all()['params']['eventID'] ?? null;
        $userNameEvent = $request->all()['params']['userNameEvent'] ?? '';
        $typeEvent = $request->all()['params']['typeEvent'] ?? '';

        if (!is_null($user) && !is_null($eventID)) {
            $joinEvent = JoinEvent::findJoin($user['user']['id'], $eventID)->first();

            if (!$joinEvent) {
                // Join Event System !!!
                JoinEvent::joinRequest($typeEvent, $eventID, $user);

                return response()->json([
                    'success' => true,
                    'joinEvent' => JoinEvent::findJoin($user['user']['id'], $eventID)->first(),
                    'message' => $typeEvent === 'private' ?
                        'You have enjoyed a request to join ' . $userNameEvent . "'" . 's event'
                        :
                        'You have join ' . $userNameEvent . "'" . 's event'
                ]);
            } else {
                return $this->badRequestResponse('You have already enjoyed a request to this event !!!');
            }
        }

        return $this->badRequestResponse('This event don\'t exist or you must to connect for join a event !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function leave(Request $request): JsonResponse
    {
        $user = $request->all()['params']['user'] ?? null;
        $eventID = $request->all()['params']['eventID'] ?? null;
        $userNameEvent = $request->all()['params']['userNameEvent'] ?? '';

        if (!is_null($user) && !is_null($eventID)) {
            $joinEvent = JoinEvent::findJoin($user['user']['id'], $eventID)->first();
            $event = Event::find($eventID);

            $userEvent = User::find($event->user_id);
            $userAuth = User::find((int)$user['user']['id']);

            if ($joinEvent) {
                $joinEvent->delete();

                // Send Notification to User's Event !!!
                $userEvent->notify(new LeaveEventNotification($userAuth, $event));

                // Send Notification for all this friends !!!
                Notification::sendNotificationEvent((int)$user['user']['id'], $event, 'leave');

                return response()->json([
                    'success' => true,
                    'joinEvent' => null,
                    'message' => 'You have leave to ' . $userNameEvent . "'" . 's event'
                ]);
            }

            return $this->badRequestResponse('You have already leave this event !!!');
        }
    }

    /**
     * @param int|string|null $userID
     * @return JsonResponse
     */
    public function joinEvents($userID): JsonResponse
    {

        $user = User::find((int)$userID);

        if ($user) {
            $eventsJoin = Event::join('join_events', 'events.id', '=', 'join_events.event_id')
                ->join('categories', 'events.category_id', '=', 'categories.id')
                ->select('events.id', 'events.title', 'events.slug', 'events.content', 'events.users_max', 'events.type_event', 'categories.name')
                ->where('join_events.user_id', $userID)
                ->where('join_events.type_event', 1)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'eventsJoin' => $eventsJoin
                ]
            ]);
        }

        return $this->badRequestResponse('You must to connect for access to this page !!!');
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
        ]);
    }
}
