<?php
namespace App\Http\Controllers\appController;

use App\concern\Helpers\DateHelpers;
use App\Friend;
use App\Http\Controllers\Controller;
use App\Planning;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanningsController extends Controller
{
    /**
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function index(string $username, string $authToken): JsonResponse
    {
        $userRequest = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if (!$userAuth || !$userRequest) {
            $this->badResponseRequest('This username don\'t exist or you isn\'t connect !!!');
        }

        $friend = Friend::FindFriend((int)$userAuth->id, (int)$userRequest->id)->first();

        if ($friend && $friend->type_friend === 1 || $userRequest->id === $userAuth->id) {
            $plannings = Planning::where('user_id', (int)$userRequest->id)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'plannings' => $plannings
                ]
            ]);
        }

        return $this->badResponseRequest('You must be friend with this user for look this planning !!!');
    }

    /**
     * @param Request $request
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function create(Request $request, string $username, string $authToken)
    {
        $activity = $request->all()['params']['activity'] ?? null;
        $date = $request->all()['params']['date'] ?? null;
        $hour = $request->all()['params']['hour'] ?? null;

        $userRequest = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if (!$userAuth || !$userRequest) {
            return $this->badResponseRequest('This username don\'t exist or you isn\'t connect !!!');
        }

        $validateData = $this->validateData($request);
        if ($validateData->fails()) {
            return $this->badResponseRequest('Your input Activity or Hours aren\'t invalid !!!');
        }

        if ($userRequest->auth_token !== $userAuth->auth_token) {
            return $this->badResponseRequest('Your can\'t create a activity on a planning to friend !!!');
        }

        // Create Activity in the table plannings
        $dateActivity = DateHelpers::dateFormatWithHour($date, $hour);
        Planning::createPlanning($activity, $dateActivity, $userRequest->id);

        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'You are create your activity with success !!!',
                'activity' => Planning::FindLastByUserId($userRequest->id)->first()
            ]
        ]);
    }

    /**
     * @param Request $request
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     */
    public function delete(Request $request, string $username, string $authToken): JsonResponse
    {
        $planningId = $request->all()['params']['planningId'] ?? null;

        $userRequest = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if (!$userAuth || !$userRequest) {
            return $this->badResponseRequest('This username don\'t exist or you isn\'t connect !!!');
        }

        if ($userRequest->auth_token !== $userAuth->auth_token) {
            return $this->badResponseRequest('Your can\'t delete a activity on a planning to friend !!!');
        }

        $planning = Planning::find((int)$planningId);

        if ($planning) {
            $planning->delete();

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'You are delete your activity with success !!!',
                    'planning' => $planning
                ]
            ]);
        }

        return $this->badResponseRequest('You can\'t delete a activity not existed !!!');
    }

    /**
     * @param Request $request
     * @param string $username
     * @param string $authToken
     * @return JsonResponse
     * @throws \Exception
     */
    public function drop(Request $request, string $username, string $authToken): JsonResponse
    {
        $planningId = $request->all()['params']['planningId'] ?? null;
        $datePlanning = $request->all()['params']['datePlanning'] ?? null;

        $userRequest = User::where('name', $username)->first();
        $userAuth = User::FindByAuthToken($authToken)->first();

        if (!$userAuth || !$userRequest) {
            return $this->badResponseRequest('This username don\'t exist or you isn\'t connect !!!');
        }

        if ($userRequest->auth_token !== $userAuth->auth_token) {
            return $this->badResponseRequest('Your can\'t drop a activity on a planning to friend !!!');
        }

        $planning = Planning::find((int)$planningId);

        if ($planning) {
            $dateOneHourMore = DateHelpers::dateFormatAddTime($datePlanning, 'PT01H');
            $planning->date_activity = $dateOneHourMore;
            $planning->save();

            return response()->json([
                'success' => true,
                'message' => 'Your activity has been updated for ' . DateHelpers::formatDateTypeString($dateOneHourMore, 'l, j F Y')
            ]);
        }

        return $this->badResponseRequest('You can\'t drop a activity not existed !!!');
    }

    /**
     * @param Request $request
     * @return \Illuminate\Contracts\Validation\Validator
     */
    private function validateData(Request $request): \Illuminate\Contracts\Validation\Validator
    {
        return Validator::make($request->all()['params'], [
            'activity' => 'required|min:5|max:50',
            'date' => 'required',
            'hour' => 'required'
        ]);
    }

    /**
     * @param string $message
     * @return JsonResponse
     */
    private function badResponseRequest(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ]);
    }
}
