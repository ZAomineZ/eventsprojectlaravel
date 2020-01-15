<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 01/01/20
 * Time: 16:08
 */

namespace App\Http\Controllers\appController;

use App\Event;
use App\Friend;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function invitationJoinEvent(Request $request): JsonResponse
    {
        $friendsCheck = $request->all()['params']['friendsCheck'] ?? [];
        $authToken = $request->all()['params']['authToken'] ?? null;
        $slug = $request->all()['params']['slug'] ?? null;

        $userAuth = User::FindByAuthToken($authToken)->first();
        $event = Event::FindBySlug($slug)->first();

        if (!$event) {
            $this->badRequestResponse('This event don\'t exist or not valid !!!');
        }

        if (!$userAuth) {
            $this->badRequestResponse('You must to be connect for accessed to this page !!!');
        }

        // Notifications and Invite all friends check on the event !!!
        Friend::invitedFriends($friendsCheck, $userAuth, $event);

        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'You have invited yours friends with success !!!'
            ]
        ]);
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
