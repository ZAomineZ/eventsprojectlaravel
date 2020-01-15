<?php

namespace App\Http\Controllers\HomeAuth;

use App\concern\Helpers\FileRenderHelper;
use App\concern\Helpers\MailHelper;
use App\concern\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationUsers(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'orderBy' => 'created_at',
                'images' => false,
                'user' => false,
                'category' => false
            ];

            $usersPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\User', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => User::friendUser($usersPaginate, $user, false)
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createNewUser(Request $request)
    {
        $name = $request->all()['params']['name'] ?? '';
        $email = $request->all()['params']['email'] ?? '';
        $password = $request->all()['params']['password'] ?? '';

        $dataUser = [
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'auth_token' => ''
        ];

        $validateData = $this->validateData($request);

        if ($validateData->fails()) {
            return response()->json([
                'success' => false,
                'message' => ' Yours informations aren\'t valid !!!'
            ]);
        }

        $user = new User($dataUser);

        // Field Uniq Verification !!!
        $saveUser = $this->fieldUniqUser($user);
        if (is_array($saveUser)) {
            return response()->json([
                'success' => $saveUser['success'],
                'message' => $saveUser['message']
            ]);
        }

        if ($saveUser) {
            // Generate new User Token
            $token = $this->generateToken($email, $password, false);

            // If Token is not a string, we return the response with redirect 201
            if (!is_string($token)) {
                return response()->json([
                    'success' => false,
                    'message' => ' Token generation failed'
                ], 201);
            }

            $user = User::where('email', $email)->get()->first();
            $user->auth_token = $token;
            $user->save();

            $response = [
                'success' => true,
                'data' =>
                    [
                        'name' => $user->name,
                        'id' => $user->id,
                        'email'=> $email,
                        'auth_token' => $token
                    ]
            ];
        } else {
            $response = [
                'success' => false,
                'message' => ' Couldn\'t register user'
            ];
        }
        return response()->json($response, 201);
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $email = $request->all()['params']['email'] ?? '';
        $password = $request->all()['params']['password'] ?? '';
        $rememberMe = $request->all()['params']['rememberMe'] ?? false;

        $user = User::where('email', $email)->get()->first();

        if ($user && $user->email_verified_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible to be connected when your email is not verified !!!'
            ], 201);
        }

        if ($user && Hash::check($password, $user->password)) {
            // Generate new User Token
            $token = $this->generateToken($email, $password, $rememberMe);

            $user->auth_token = $token;

            // Remember Me Token
            $user->remember_token = $rememberMe ? Str::random(90) : null;

            $user->save();

            $response = [
                'success' => true,
                'data' =>
                    [
                        'name' => $user->name,
                        'id' => $user->id,
                        'email'=> $user->email,
                        'auth_token' => $user->auth_token,
                        'remember_me' => $user->remember_token !== null ? $user->remember_token : ''
                    ]
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Bad Itendifiants !!!'
            ];
        }

        return response()->json($response, 201);
    }

    /**
     * @param string $tokenRemember
     * @return \Illuminate\Http\JsonResponse
     */
    public function reconnectCookie(string $tokenRemember)
    {
        $rememberToken = $tokenRemember ?? false;

        if ($rememberToken) {
            $user = User::where('remember_token', $rememberToken)->get()->first();

            if ($user) {
                // Generate new User Token
                $token = $this->generateToken($user->email, $user->password, $rememberToken ? true : false);

                $user->auth_token = $token;

                // Remember Me Token
                $user->remember_token = $rememberToken;

                $user->save();

                $response = [
                    'success' => true,
                    'data' =>
                        [
                            'name' => $user->name,
                            'id' => $user->id,
                            'email'=> $user->email,
                            'auth_token' => $user->auth_token,
                            'remember_me' => $user->remember_token !== null ? $user->remember_token : ''
                        ]
                ];
                return response()->json($response, 201);
            } else {
                $response = [
                    'success' => false,
                    'data' =>
                        [
                            'error' => 'Bad Token Remember !!!'
                        ]
                ];
                return response()->json($response, 201);
            }
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgetPassword(Request $request)
    {
        $email = $request['params']['email'] ?? '';
        $user = User::where('email', $email)->get()->first();

        if ($user) {
            // Email Verificated !!!
            $user->email_verified_at = date('Y-m-d H:i:s');
            $user->save();

            // Attributes For SendMail !!!
            $username = $user->username ?? '';
            $token = $user->auth_token ?? '';

            // Enjoy Email to User !!!
            $phpMailer = new PHPMailer();
            $helperFileRender = new FileRenderHelper();
            try {
                // If any Error Found Enjoy Email !!!
                (new MailHelper($phpMailer, $helperFileRender))
                    ->SendMail($username, $email, $token);

                $response = [
                    'success' => true,
                    'data' => [
                        'message' => 'An Email you have been enjoyed !!!'
                    ]
                ];
                return response()->json($response, 201);
            } catch (Exception $e) {
                if ($e->getMessage()) {
                    // Enjoy Render Json Code Error !!!
                    $response = [
                        'success' => false,
                        'data' => [
                            'message' => $e->getMessage()
                        ]
                    ];
                    return response()->json($response, 201);
                }
            }
        } else {
            $response = [
                'success' => false,
                'data' => [
                    'message' => 'This email isn\'t not valid !!! '
                ]
            ];
            return response()->json($response, 201);
        }
    }

    /**
     * @param Request $request
     * @return mixed
     */
    private function validateData(Request $request)
    {
      return Validator::make($request->all()['params'], [
           'name' => 'required|min:3',
           'email' => 'required',
           'password' => 'required'
       ]);
    }

    /**
     * @param string|null $email
     * @param string|null $password
     * @param bool|null $rememberMe
     * @return false|\Illuminate\Http\JsonResponse|string
     */
    private function generateToken(?string $email, ?string $password, ?bool $rememberMe)
    {
        $token = null;
        try {
            $token = JWTAuth::attempt(['email' => $email, 'password' => $password], $rememberMe);
        } catch (JWTException $exception) {
            return response()->json([
                'response' => 'error',
                'message' => 'Token creation failed',
            ]);
        }
        return $token;
    }

    /**
     * @param User $user
     * @return array|bool
     */
    private function fieldUniqUser(User $user)
    {
        try {
           return $user->save();
        } catch (QueryException $exception) {
            $messageError = $exception->getMessage();
            if (strpos($messageError, 'users_email_unique') !== false) {
                return [
                    'success' => false,
                    'message' => ' This email is already existed !!!'
                ];
            }
        }
    }
}
