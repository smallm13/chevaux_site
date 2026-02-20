<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return redirect('/'); // redirige vers la page d'accueil avec la modale login
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            // Récupération du rôle de l'utilisateur connecté
            $user = Auth::user();

            // Redirection en fonction du rôle
            $redirectTo = $user->role === 'admin'
                ? '/admin'   // 🔹 ton espace admin
                : '/utilisateur';   // 🔹 espace utilisateur simple (change si besoin)

            // 🔹 Si la requête vient d'AJAX (fetch), on renvoie JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'redirect' => $redirectTo
                ]);
            }

            // 🔹 Sinon redirection classique
            return redirect($redirectTo);
        }

        // Connexion échouée
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => "Identifiants incorrects."
            ], 401);
        }

        return back()->withErrors([
            'email' => 'Les informations d\'identification sont incorrectes.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'redirect' => url('/login')
        ]);
    }
    protected function authenticated(Request $request, $user)
    {
        return redirect('/utilisateur');
    }
}
