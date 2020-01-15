<?php

namespace App\Http\Controllers\HomeAuth;

use App\Comment;
use App\concern\Helpers\PaginationHelper;
use App\Event;
use App\Http\Controllers\Controller;
use App\Notification;
use App\Notifications\CommentCreateNotification;
use App\Notifications\ReplyCommentCreateNotification;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentsController extends Controller
{
    /**
     * @param Request $request
     * @param string $slug
     * @return JsonResponse
     */
    public function createComment(Request $request, string $slug)
    {
        $event = Event::findBySlug($slug);

        if ($event) {
            $comment = $request->all()['params']['comment'] ?? null;
            $user = $request->all()['params']['auth'] ?? null;

            if ($user && !empty($comment)) {
                $validator = Validator::make($request->all()['params'], [
                    'comment' => 'required|min:5|max:500'
                ]);

                if ($validator->fails()) {
                    return $this->responseBadMessage('A Error has found during the transaction of Comment !!!');
                }

                if ($validator->validate()) {
                    Comment::create([
                        'content' => $comment,
                        'event_id' => $event->id,
                        'user_id' => (int)$user['user']['id']
                    ]);

                    // Send Notification to User to the Event !!!
                    Notification::sendNotificationCommentCreate($user['user']['id'], $event);

                    $comments = Comment::settingsData(Comment::allByEvent($event->id)->get());

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'message' => 'Your comment has created with success !!!',
                            'comments' => Comment::withReply($comments)
                        ]
                    ]);
                }
            }
        }
    }

    /**
     * @param Request $request
     * @param string $slug
     * @return JsonResponse
     */
    public function replyComment(Request $request, string $slug)
    {
        $event = Event::findBySlug($slug);

        if ($event) {
            $comment = $request->all()['params']['comment'] ?? null;
            $user = $request->all()['params']['auth'] ?? null;
            $replyId = $request->all()['params']['reply_id'] ?? null;

            if ($user && !empty($comment)) {
                $validator = Validator::make($request->all()['params'], [
                    'comment' => 'required|min:5|max:500',
                    'reply_id' => 'required|numeric'
                ]);

                if ($validator->fails()) {
                    return $this->responseBadMessage('A Error has found during the transaction of Comment !!!');
                }

                if ($validator->validate()) {
                    Comment::create([
                        'content' => $comment,
                        'event_id' => $event->id,
                        'user_id' => (int)$user['user']['id'],
                        'reply_id' => (int)$replyId
                    ]);

                    // Send Notification to User to the Event !!!
                    Notification::sendNotificationCommentCreate($user['user']['id'], $event);

                    // Send Notification to User Comment !!!
                    Notification::sendNotificationReplyCommentCreate($replyId, $user['user']['id'], $event);

                    $comment = Comment::where('id', (int)$replyId)
                        ->with('user:id,name')
                        ->first();

                    $comments = Comment::settingsData(Comment::allByEvent($event->id)->get());

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'message' => 'Your reply comment to ' . $comment->user->name . ' has been done with success !!!',
                            'comments' => Comment::withReply($comments)
                        ]
                    ]);
                }
            }
        }
    }

    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function index(string $authToken)
    {
        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $comments = Comment::select('id', 'content', 'reply_id', 'updated_at', 'created_at')
                ->where('user_id', (int)$user->id)
                ->paginate(5);

            return response()->json([
                'success' => true,
                'data' => [
                    'comments' => Comment::allWithReply($comments)
                ]
            ], 200);
        }

        return $this->responseBadMessage('This user don\'t exist !!!');
    }

    /**
     * @param Request $request
     * @param int|string|null $commentID
     * @return JsonResponse
     */
    public function update(Request $request, $commentID): JsonResponse
    {
        $user = $request->all()['params']['user'] ?? null;
        $content = $request->all()['params']['commentValue'] ?? '';

        $comment = Comment::find((int)$commentID);

        if ($comment && $comment->user_id === $user['user']['id']) {
            $comment->content = $content;
            $comment->save();
            return response()->json([
                'success' => true,
                'message' => 'You are updated your comment with success !!!'
            ]);
        }

        return $this->responseBadMessage('This Comment isn\'t exist or don\'t belong to you !!!');
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationMyComments(Request $request)
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'attributes' => [
                  'user_id' => (int)$user->id
                ],
                'images' => false,
                'user' => false,
                'category' => false
            ];

            $commentsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Comment', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'comments' => Comment::allWithReply($commentsPaginate, false)
                ]
            ]);
        }
    }

    /**
     * @param string $message
     * @return JsonResponse
     */
    private function responseBadMessage(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ]);
    }
}
