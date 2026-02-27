<?php

namespace App\Http\Controllers;

use App\Models\User; // Le bon modÃ¨le
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'nom', 'prenom', 'email', 'role')->get();

        return response()->json($users);
    }
    public function count()
    {
        return response()->json(['count' => User::count()]);
    }

    public function realtimeStats()
    {
        $onlineSince = Carbon::now()->subMinutes(5);
        $activeSince = Carbon::now()->subHours(24);

        return response()->json([
            'online' => User::where('last_seen_at', '>=', $onlineSince)->count(),
            'active' => User::where('last_login_at', '>=', $activeSince)->count(),
        ]);
    }

}

