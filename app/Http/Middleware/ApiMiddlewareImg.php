<?php

namespace App\Http\Middleware;

use Closure;

class ApiMiddlewareImg
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
        $response = $next($request);
        $response->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Content-Range, Content-Disposition, Content-Description, X-Auth-Token');
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'PUT, GET, POST');
        $response->header('Content-Type', 'multipart/form-data, application/json');
        $response->header('Accept','multipart/form-data, application/json');
        return $response;
    }
}
