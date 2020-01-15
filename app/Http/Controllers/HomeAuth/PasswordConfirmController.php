<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 03/12/19
 * Time: 01:36
 */

namespace App\Http\Controllers\HomeAuth;


use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class PasswordConfirmController
{
    /**
     * @param string $authToken
     * @return \Illuminate\Http\JsonResponse
     */
    public function tokenUserExist(string $authToken)
    {
        if (is_string($authToken)) {
            $user = User::where('auth_token', $authToken)->get()->first();
            if ($user && $user->email_verified_at !== null) {
                return response()->json([
                    'success' => true
                ]);
            }
            return response()->json([
                'success' => false,
                'data' => [
                    'message' => 'You account is already validate !!!'
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function newPasswordConfirm(Request $request)
    {
        $password = $request->all()['params']['password'] ?? '';
        $passwordConfirm = $request->all()['params']['passwordConfirm'] ?? '';
        $authToken = $request->all()['params']['authToken'] ?? '';

        // Verif if password is equal to passwordConfirm !!!
        if ($password === $passwordConfirm) {
            // Search User with params authToken !!!
            $user = User::where('auth_token', $authToken)->get()->first();
            if ($user && $user->email_verified_at !== null) {
                // Definitate new Token Auth !!!
                $token = $this->generateToken($user->email, $password, false);

                $user->auth_token = $token;
                $user->password = Hash::make($password);
                $user->email_verified_at = null;

                // Update User with Method Save !!!
                $user->save();

                $response = [
                    'success' => true,
                    'data' => [
                        'message' => 'You are updated your password with success !!!'
                    ]
                ];

                return response()->json($response, 201);
            } else {
                $response = [
                    'success' => false,
                    'data' => [
                        'message' => 'You account is already validate !!! !!!'
                    ]
                ];
                return response()->json($response, 201);
            }
        }

        $response = [
            'success' => false,
            'data' => [
                'message' => 'Your Password Field and your Password Confirm Field aren\'t identical !!!'
            ]
        ];
        return response()->json($response, 201);
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
}
