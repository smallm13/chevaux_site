<?php

namespace App\Http\Controllers;

use App\Models\User; // Le bon modèle
use Illuminate\Http\Request;

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

}
