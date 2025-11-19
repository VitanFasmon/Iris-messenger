<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastOnline
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth('api')->check()) {
            $user = auth('api')->user();
            
            // Update last_online only if it's been more than 5 minutes since last update
            // This prevents excessive database writes
            if (!$user->last_online || $user->last_online->diffInMinutes(now()) >= 5) {
                $user->updateLastOnline();
            }
        }

        return $next($request);
    }
}
