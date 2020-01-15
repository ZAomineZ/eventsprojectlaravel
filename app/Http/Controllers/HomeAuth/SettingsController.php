<?php

namespace App\Http\Controllers\HomeAuth;

use App\Event;
use App\Friend;
use App\Http\Controllers\Controller;
use App\Setting;
use App\User;
use function GuzzleHttp\Psr7\str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    /**
     * @param string $username
     * @param string $authToken
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(string $username, string $authToken)
    {
        $userProfile = User::select('id', 'name')
            ->where('name', $username)
            ->first();

        $userConnect = User::select('id', 'name')
            ->where('auth_token', $authToken)
            ->first();

        if (!$userConnect) {
            return $this->responseBadUser('Bad Request User !!!');
        }

        if ($userProfile) {
            $events = Event::where('user_id', (int)$userProfile->id)
                ->orderBy('created_at', 'DESC')
                ->limit(4)
                ->get();

            $setting = Setting::select('id', 'image_user')
                ->where('user_id', $userProfile->id)
                ->first();

            $friends = Friend::getUserFriend($userProfile->id)
                ->limit('4')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'username' => $userProfile->name,
                    'events' => $events,
                    'image_user' => $setting ? $setting->image_user : '',
                    'friendRequest' => Friend::findFriend($userProfile->id, $userConnect->id)->first(),
                    'friends' => Friend::allFriends($friends, $userConnect->id, false)
                ]
            ], 201);
        }

        return response()->json([
            'success' => false,
            'data' => [
                'message' => 'This username don\'t exist !!!'
            ]
        ], 201);
    }

    /**
     * @param Request $request
     * @param string $username
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitSecure(Request $request, string $username)
    {
        if (is_string($username)) {
            $user = User::where('name', $username)->first();
            $userJson = $request->all()['params']['user'];

            if ($user && $user->id === $userJson['user']['id']) {
                $newUsername = $request->all()['params']['username'] ?? $username;
                $newEmail = $request->all()['params']['email'] ?? $userJson['user']['email'];
                $newPassword = $request->all()['params']['password'] ?? '';
                $newPasswordConfirm = $request->all()['params']['password_confirm'] ?? '';

                return $this->responseSuccessRequest($newUsername, $newEmail, $newPassword, $newPasswordConfirm, $user);
            }
            return $this->responseBadUser('You can\'t access to this page !!!');
        }
    }

    /**
     * @param Request $request
     * @param string $username
     * @return JsonResponse
     */
    public function submitPrivate(Request $request, string $username): JsonResponse
    {
        if (is_string($username)) {
            $user = User::where('name', $username)->first();
            $userJson = $request->all()['params']['user'];

            if ($user && $user->id === $userJson['user']['id']) {
                $country = $request->all()['params']['country'] ?? null;
                $birthDate = $request->all()['params']['birth_date'] ?? date('Y-m-d');
                $activity = $request->all()['params']['activity'] ?? null;
                $gender = $request->all()['params']['gender'] ?? null;
                $bio = $request->all()['params']['bio'] ?? null;

                return $this->responseRequestPrivate($country, $birthDate, $activity, $gender, $bio, $user);
            }
            return $this->responseBadUser('You can\'t access to this page !!!');
        }
    }

    /**
     * @param Request $request
     * @param string $username
     * @return JsonResponse
     */
    public function submitPicture(Request $request, string $username)
    {
        if (is_string($username)) {
            $user = User::where('name', $username)->first();
            $userJson = $request->user ? json_decode($request->user) : null;

            if ($user && $user->id === $userJson->user->id) {
                return $this->pictureResponse($request, $user);
            }
        }
    }

    /**
     * @param string $username
     * @param string $auth_token
     * @return \Illuminate\Http\JsonResponse
     */
    public function accessPageSetting(string $username, string $auth_token): JsonResponse
    {
        // Access Page, if User exist and username is equal to User connect !!!
        $setting = new Setting();
        $access = $setting->accessPageOrNot($auth_token, $username);

        if (!$access) {
            return response()->json([
                'success' => false,
                'data' => ['message' => 'Impossible to access this page !!!']
            ]);
        } else {
            $user = User::select('id', 'updated_at')
                ->where('name', $username)
                ->where('auth_token', $auth_token)
                ->first();

            $setting = Setting::select('id', 'country', 'birth_date', 'activity', 'gender', 'bio', 'image_user')
                ->where('user_id', $user->id)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'setting' => $setting
                ]
            ]);
        }
    }

    /**
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    private function responseBadUser(string $message)
    {
        return response()->json([
            'success' => false,
            'data' => [
                'message' => $message
            ]
        ], 201);
    }

    /**
     * @param string $newUsername
     * @param string $newEmail
     * @param string $newPassword
     * @param string $newPasswordConfirm
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    private function responseSuccessRequest(
        string $newUsername,
        string $newEmail,
        string $newPassword,
        string $newPasswordConfirm,
        User $user
    )
    {
        $newUser = Setting::updateUser($user, $newUsername, $newEmail);

        if ($newUser) {
            if (!empty($newPassword) && !empty($newPasswordConfirm)) {
                // Update Password, If and only if the two passwords are equals !!!
                if ($newPassword === $newPasswordConfirm) {
                    $user->password = Hash::make($newPassword);
                    $user->save();
                } else {
                    return $this->responseBadUser('Yours passwords aren\'t equal !!!');
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ]
            ]);
        }

        return $this->responseBadUser('Update not success !!!');
    }

    /**
     * @param null|string $country
     * @param null|string $birthDate
     * @param null|string $activity
     * @param null|string $gender
     * @param null|string $bio
     * @param User $user
     * @return JsonResponse
     */
    private function responseRequestPrivate(
        ?string $country,
        ?string $birthDate,
        ?string $activity,
        ?string $gender,
        ?string $bio,
        User $user
    ): JsonResponse
    {
        try {
            $requestValid = Setting::makeRequest($country, $birthDate, $activity, $gender, $bio, $user);

            if ($requestValid) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'message' => 'Yours private settings are been checked with success !!!'
                    ]
                ]);
            }
            return $this->responseBadUser('A error is occurred during the request !!!');
        } catch (ModelNotFoundException $exception) {
            return $this->responseBadUser($exception->getMessage());
        } catch (\Exception $exception) {
            return $this->responseBadUser($exception->getMessage());
        }
    }

    /**
     * @param Request $request
     * @param User $user
     * @return JsonResponse
     */
    private function pictureResponse(Request $request, User $user)
    {
        if ($request->has('avatar')) {
            $setting = new Setting();
            $avatar = $setting->saveAvatar($request, $user);

            if (!isset($avatar['message'])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'message' => 'You are updated your image to profile with success !!!',
                        'avatar' => $avatar
                    ]
                ]);
            }
            return $this->responseBadUser($avatar['message']);
        }
    }
}
