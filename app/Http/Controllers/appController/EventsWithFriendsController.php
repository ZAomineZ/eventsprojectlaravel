<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 31/12/19
 * Time: 16:57
 */

namespace App\Http\Controllers\appController;

use App\concern\Helpers\PaginationHelper;
use App\Event;
use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventsWithFriendsController extends Controller
{
    /**
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function index(string $username, string $authToken): JsonResponse
    {
        $userFound = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if ($userFound) {
            if ($userAuth) {
                $events = Event::with('images')
                    ->where('title', '!=', '')
                    ->where('user_id', (int)$userFound->id)
                    ->paginate(12);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'events' => $events,
                        'username' => $userFound->name
                    ]
                ]);
            }

            return $this->badRequestResponse('You must to be connected for accessed to this page');
        }

        return $this->badRequestResponse('This username isn\'t valid or don\'t exist !!!');
    }

    /**
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function eventsFriendsActive(string $username, string $authToken): JsonResponse
    {
        $userFound = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if ($userFound) {
            if ($userAuth) {
                $events = Event::with('images')
                    ->where('title', '!=', '')
                    ->where('user_id', (int)$userFound->id)
                    ->where('date_event', '>', date('Y-m-d H:i:s'))
                    ->paginate(12);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'events' => $events,
                        'username' => $userFound->name
                    ]
                ]);
            }

            return $this->badRequestResponse('You must to be connected for accessed to this page');
        }

        return $this->badRequestResponse('This username isn\'t valid or don\'t exist !!!');
    }

    /**
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function eventsFriendsNoActive(string $username, string $authToken): JsonResponse
    {
        $userFound = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if ($userFound) {
            if ($userAuth) {
                $events = Event::with('images')
                    ->where('title', '!=', '')
                    ->where('user_id', (int)$userFound->id)
                    ->where('date_event', '<', date('Y-m-d H:i:s'))
                    ->paginate(12);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'events' => $events,
                        'username' => $userFound->name
                    ]
                ]);
            }

            return $this->badRequestResponse('You must to be connected for accessed to this page');
        }

        return $this->badRequestResponse('This username isn\'t valid or don\'t exist !!!');
    }

    /**
     * @param Request $request
     * @param string $username
     * @return JsonResponse
     */
    public function paginationEventsAllByUsername(Request $request, string $username): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;
        $typeEvents = $request->all()['params']['typeEvents'] ?? '';

        $userAuth = User::FindByAuthToken($authToken)->first();
        $userFound = User::where('name', $username)->first();

        if ($userAuth) {
            $options = [
                'attributes' => [
                    'user_id' => (int)$userFound->id,
                ],
                'attributesSyntax' => [
                    'name' => 'title',
                    'sign' => '!=',
                    'value' => ''
                ],
                'images' => true,
                'user' => false,
                'category' => false,
                'toUser' => false
            ];

            if ($typeEvents !== 'all') {
                $options['attributesSyntaxTwo']['name'] = 'date_event';
                $options['attributesSyntaxTwo']['sign'] = $typeEvents === 'active' ? '>' : '<';
                $options['attributesSyntaxTwo']['value'] = date('Y-m-d H:i:s');
            }

            $events = PaginationHelper::pagination($selectedPage, $perPage, 'App\Event', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $events
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
        ]);
    }
}
