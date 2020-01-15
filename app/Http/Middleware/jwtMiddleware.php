<?php

namespace App\Http\Middleware;

use App\User;
use Closure;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class jwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $token = $request->input('token');

        if (!$token) {
            return $next($request);
            return response()->json(['error' => 'Token not found !!!']);
        }

        try {
            $user = JWTAuth::toUser(JWTAuth::getToken());
        } catch (\Exception $exception) {
            if ($exception instanceof TokenExpiredException) {
                $refreshed = JWTAuth::refresh(JWTAuth::getToken());
                $user = JWTAuth::setToken($refreshed)->toUser();
                return $next($request);
            } elseif ($exception instanceof TokenInvalidException) {
                return $next($request);
                return response()->json(['error' => 'The token is invalid !!!']);
            } elseif ($exception instanceof AccessDeniedHttpException) {
                return $next($request);
                return response()->json(['error' => 'Access not authorized !!!']);
            } else {
                return $next($request);
                return response()->json(['error' => 'Token Request is Invalid !!!']);
            }
        }
        return $next($request);
    }
}
