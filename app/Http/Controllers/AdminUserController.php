<?php

namespace App\Http\Controllers;

use App\Models\User; // Le bon modÃƒÂ¨le
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

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

    public function kpis()
    {
        $since24h = Carbon::now()->subHours(24);
        $since7d = Carbon::now()->subDays(7);

        return response()->json([
            'users_total' => User::count(),
            'users_new_24h' => User::where('created_at', '>=', $since24h)->count(),
            'users_new_7d' => User::where('created_at', '>=', $since7d)->count(),
            'horses_total' => DB::table('chevaux')->count(),
            'horses_new_24h' => DB::table('chevaux')->where('created_at', '>=', $since24h)->count(),
            'horses_new_7d' => DB::table('chevaux')->where('created_at', '>=', $since7d)->count(),
        ]);
    }

}


