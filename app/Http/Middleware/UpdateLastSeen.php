<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $lastTouch = (int) $request->session()->get('last_seen_touch', 0);

            // Limit DB writes to one update per minute per session.
            if (time() - $lastTouch >= 60) {
                $request->user()->forceFill([
                    'last_seen_at' => now(),
                ])->save();

                $request->session()->put('last_seen_touch', time());
            }
        }

        return $next($request);
    }
}

