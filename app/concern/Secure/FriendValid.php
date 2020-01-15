<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 01/01/20
 * Time: 13:30
 */

namespace App\concern\Secure;

use App\Friend;

class FriendValid
{
    /**
     * @param int $fromUserId
     * @param int $toUserId
     * @return \Illuminate\Http\JsonResponse
     */
    public static function existFriend (int $fromUserId, int $toUserId)
    {
        $friend = Friend::where('from_user_id', $fromUserId)
            ->where('to_user_id', $toUserId)
            ->first();

        if (!$friend) {
            return response()->json([
                'success' => false,
                'message' => 'You must to be friend with this User for check this informations !!!'
            ]);
        }
    }
}
