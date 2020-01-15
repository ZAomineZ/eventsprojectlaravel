<?php

namespace App\Http\Controllers\HomeAuth;

use App\Event;
use App\Image;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ImagesController extends Controller
{
    /**
     * @param int|string $imageId
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($imageId, Request $request)
    {
        if (is_string($imageId) || is_int($imageId)) {
            $user = $request->all()['params']['user'];
            $userJson = json_decode($user);
            $image = Image::where('id', $imageId)->firstOrFail();
            if ($image) {
                $event = Event::where('id', $image->event_id)
                    ->where('user_id', $userJson->user->id)
                    ->firstOrFail();

                if ($event) {
                    $imageModel = new Image();
                    $imageModel->unlinkImage($image);
                    $image->delete();
                    return $this->responseImage($event->id);
                }
            }
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFileRequest(Request $request): JsonResponse
    {
        if ($request->has('file')) {
            $user = User::FindByAuthToken($request->input('authToken'))->first();

            if ($user) {
                $dateToday = date('Y-m-d');

                if ($request->has('slugEvent')) {
                    $event = Event::FindBySlug($request->input('slugEvent'))->first();
                } else {
                    $event = Event::where('user_id', (int)$user->id)
                        ->where('title', '')
                        ->orderByDesc('id')
                        ->limit(1)
                        ->first();
                }

                $fileName = $request->file('file')->getClientOriginalName();
                $imageFile = $dateToday . '_' . $event->id . '_' . $user->id . '_';

                $image = Image::where('name', $imageFile . $fileName)->first();

                if ($image) {
                    $model = new Image();
                    $model->unlinkImage($image);
                    $image->delete();

                    return response()->json([]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'This Image dont exist !!!'
                ]);
            }
        }
    }

    /**
     * @param int|string $eventId
     * @return \Illuminate\Http\JsonResponse
     */
    private function responseImage($eventId)
    {
        $images = Image::where('event_id', $eventId)
            ->get();
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Your Image has been deleted with success !!!',
                'images' => $images
            ]
        ], 201);
    }
}
