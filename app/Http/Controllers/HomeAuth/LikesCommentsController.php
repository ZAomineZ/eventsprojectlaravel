<?php
namespace App\Http\Controllers\HomeAuth;

use App\Comment;
use App\Event;
use App\LikeComment;
use App\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LikesCommentsController extends Controller
{
    /**
     * @param Request $request
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function addLike(Request $request, string $slug): JsonResponse
    {
        $event = Event::findBySlug($slug);

        if ($event) {
            $userID = $request->all()['params']['userID'] ?? null;
            $commentID = $request->all()['params']['commentID'] ?? null;

            $comment = Comment::with('user:id,name')->find((int)$commentID);

            if ($comment) {
                if (!is_null($userID) && !is_null($commentID)) {
                    $likeComment = LikeComment::select('id')
                        ->where('user_id', (int)$userID)
                        ->where('comment_id', (int)$commentID)
                        ->first();

                    if ($likeComment) {
                        Comment::removeLike((int)$commentID);
                        $likeComment->delete();

                        // Send Notification Warning remove like for User's Comment !!!
                        Notification::sendNotificationLikeComment($comment->user->id, $userID, $event, 'remove this like');

                        $comments = Comment::settingsData(Comment::allByEvent($event->id)->get());

                        return response()->json([
                            'success' => true,
                            'data' => [
                                'comments' => Comment::withReply($comments),
                                'message' => 'You are remove your like the comment to ' . $comment->user->name . ' with success !!!'
                            ]
                        ], 201);
                    } else {
                        Comment::addLike((int)$commentID);
                        LikeComment::addLikeUser($userID, (int)$commentID);

                        $comments = Comment::settingsData(Comment::allByEvent($event->id)->get());

                        // Send Notification Warning like for User's Comment !!!
                        Notification::sendNotificationLikeComment($comment->user->id, $userID, $event, 'like');

                        return response()->json([
                            'success' => true,
                            'data' => [
                                'comments' => Comment::withReply($comments),
                                'message' => 'You are like the comment to ' . $comment->user->name . ' with success !!!'
                            ]
                        ], 201);
                    }
                } else {
                    return $this->responseBadRequest('This Comment don\'t exist, you are too connect for like a comment !!!');
                }
            } else {
                return $this->responseBadRequest('This Comment don\'t exist !!!');
            }
        } else {
            return $this->responseBadRequest('This Event don\'t exist !!!');
        }
    }

    /**
     * @param string $message
     * @return JsonResponse
     */
    public function responseBadRequest(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], 201);
    }
}
