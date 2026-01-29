<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /* ===================== */
    /* CRÉER UTILISATEUR */
    /* ===================== */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:user,admin'
        ]);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'utilisateur' => $user
        ], 201);
    }

    /* ===================== */
    /* LISTER UTILISATEURS */
    /* ===================== */
    public function index()
    {
        return response()->json(User::all());
    }

    /* ===================== */
    /* AFFICHER UN UTILISATEUR */
    /* ===================== */
    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    /* ===================== */
    /* MODIFIER UTILISATEUR */
    /* ===================== */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'role' => 'required|in:user,admin',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Utilisateur modifié avec succès'
        ]);
    }

    /* ===================== */
    /* SUPPRIMER UTILISATEUR */
    /* ===================== */
    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}
