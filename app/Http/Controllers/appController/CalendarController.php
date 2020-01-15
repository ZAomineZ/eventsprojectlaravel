<?php
namespace App\Http\Controllers\appController;

use App\Category;
use App\Event;
use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function index (string $authToken): JsonResponse
    {
        $user = User::findByAuthToken($authToken)->first();

        if ($user) {
            $categories = Category::all();
            $events = Event::where('user_id', (int)$user->id)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'events' => $events
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'You must be connected for accessed to this page !!!'
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function dropEvent(Request $request): JsonResponse
    {
       $idEvent = $request->all()['params']['idEvent'] ?? null;
       $dateNewEvent = $request->all()['params']['newDateEvent'] ?? null;

       $eventCalendar = Event::find((int)$idEvent);

       if ($eventCalendar) {
           $newDate = date('Y-m-d H:i:s', strtotime($dateNewEvent));
           $eventCalendar->date_event = $newDate;
           $eventCalendar->save();

           $dateMessage = date('l d F, g:i', strtotime($dateNewEvent));

           return response()->json([
               'success' => true,
               'message' => 'Your event has beenn modified for the ' . $dateMessage . ' hours !!!'
           ]);
       }

       return response()->json([
           'success' => true,
           'message' => 'This event don\'t exist !!!'
       ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function clickEvent(Request $request): JsonResponse
    {
        $idEvent = $request->all()['params']['idEvent'] ?? null;

        $event = Event::where('id', (int)$idEvent)
            ->with('position_places')
            ->with('images')
            ->first();

        if ($event) {
            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $event
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'This event don\'t exist !!!'
        ]);
    }
}
