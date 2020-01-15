<?php

namespace App\Http\Controllers\HomeAuth;

use App\Event;
use App\Http\Controllers\Controller;
use App\PositionPlace;
use Illuminate\Http\JsonResponse;

class PositionPlacesController extends Controller
{
    /**
     * @param string $slug
     * @return JsonResponse
     */
    public function map(string $slug): JsonResponse
    {
        $event = Event::FindBySlug($slug)->first();
        if (!$event) {
            return $this->badRequestResponse('The map to this event don\'t exist !!!');
        }

        $position = PositionPlace::FindByEvent($event->id)->first();
        if ($position) {
            return response()->json([
                'success' => true,
                'data' => [
                    'position' => $position
                ]
            ], 201);
        } else {
            return $this->badRequestResponse('The map to this event don\'t exist !!!');
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
