<?php

namespace App\Http\Controllers;

use App\Models\Horse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HorseController extends Controller
{
    // Récupérer tous les chevaux
    public function index()
    {
        return response()->json(
            Horse::select(
                'nom as name',
                'race as breed',
                'robe as coat',
                'age',
                'taille as height',
                'proprietaire as owner'
            )->get()
        );
    }

    // Recherche
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }

        $horses = Horse::select(
            'nom as name',
            'race as breed',
            'robe as coat',
            'age',
            'taille as height',
            'proprietaire as owner'
        )
            ->where('nom', 'LIKE', "%{$q}%")
            ->orWhere('race', 'LIKE', "%{$q}%")
            ->orWhere('robe', 'LIKE', "%{$q}%")
            ->orWhere('proprietaire', 'LIKE', "%{$q}%")
            ->get();

        return response()->json($horses);
    }

    // Statistiques par robe
    public function stats()
    {
        $stats = Horse::select('robe as coat', DB::raw('COUNT(*) as count'))
            ->groupBy('robe')
            ->orderByDesc('count')
            ->get();

        return response()->json($stats);
    }

    // Ajouter un cheval
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'race' => 'required|string',
            'robe' => 'required|string',
            'age' => 'required|integer',
            'taille' => 'required|string',
            'proprietaire' => 'required|string',
        ]);

        $horse = Horse::create($request->all());

        return response()->json($horse);
    }
    public function destroy($id)
{
    $horse = Horse::findOrFail($id);
    $horse->delete();

    return response()->json([
        'message' => 'Cheval supprimé avec succès'
    ]);
}
    public function show($id)
{
    return Horse::findOrFail($id);
}

public function update(Request $request, $id)
{
    // 1️⃣ Validation des données
    $validated = $request->validate([
        'nom' => 'required|string',
        'race' => 'nullable|string',
        'robe' => 'nullable|string',
        'age' => 'nullable|integer',
        'taille' => 'nullable|string',
        'proprietaire' => 'nullable|string',
    ]);

    // 2️⃣ Récupération du cheval
    $horse = Horse::findOrFail($id);

    // 3️⃣ Mise à jour
    $horse->update($validated);

    // 4️⃣ Réponse
    return response()->json([
        'message' => 'Cheval mis à jour avec succès',
        'horse' => $horse
    ]);
}
}