<?php

namespace App\Http\Controllers;

use App\Models\Horse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HorseController extends Controller
{
    private function horseListQuery()
    {
        return Horse::query()->selectRaw("
            nom as name,
            race as breed,
            robe as coat,
            COALESCE(annee_naissance, YEAR(date_naissance)) as birth_year,
            CASE
                WHEN annee_naissance IS NOT NULL THEN YEAR(CURDATE()) - annee_naissance
                WHEN date_naissance IS NOT NULL THEN TIMESTAMPDIFF(YEAR, date_naissance, CURDATE())
                ELSE NULL
            END as age,
            taille as height
        ");
    }

    public function index()
    {
        return response()->json($this->horseListQuery()->get());
    }

    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }

        $horses = $this->horseListQuery()
            ->where('nom', 'LIKE', "%{$q}%")
            ->orWhere('race', 'LIKE', "%{$q}%")
            ->orWhere('robe', 'LIKE', "%{$q}%")
            ->get();

        return response()->json($horses);
    }

    public function stats()
    {
        $stats = Horse::select('robe as coat', DB::raw('COUNT(*) as count'))
            ->groupBy('robe')
            ->orderByDesc('count')
            ->get();

        return response()->json($stats);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Cheval
            'nom' => 'required|string|max:150',
            'race' => 'nullable|string|max:100',
            'sexe' => 'nullable|string|max:20',
            'robe' => 'nullable|string|max:50',
            'annee_naissance' => 'nullable|integer|min:1900|max:2100',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:150',
            'sire_numero' => 'nullable|string|max:20',
            'ueln_numero' => 'nullable|string|max:30',
            'studbook_naissance' => 'nullable|string|max:150',
            'transpondeur' => 'nullable|in:0,1',
            'numero_transpondeur' => 'nullable|string|max:30',
            'date_pose_transpondeur' => 'nullable|date',
            'taille' => 'nullable|numeric',

            // Pedigree
            'pere_nom' => 'nullable|string|max:150',
            'pere_sire_numero' => 'nullable|string|max:20',
            'pere_ueln_numero' => 'nullable|string|max:30',
            'pere_date_naissance' => 'nullable|date',
            'pere_pays_naissance' => 'nullable|string|max:100',
            'pere_studbook' => 'nullable|string|max:150',

            'mere_nom' => 'nullable|string|max:150',
            'mere_sire_numero' => 'nullable|string|max:20',
            'mere_ueln_numero' => 'nullable|string|max:30',
            'mere_date_naissance' => 'nullable|date',
            'mere_pays_naissance' => 'nullable|string|max:100',
            'mere_studbook' => 'nullable|string|max:150',

            // Naisseur
            'naisseur_nom' => 'nullable|string|max:200',
            'naisseur_adresse' => 'nullable|string',
            'naisseur_telephone' => 'nullable|string|max:30',
        ]);

        $horse = DB::transaction(function () use ($validated) {
            $horseData = [
                'nom' => $validated['nom'],
                'race' => $validated['race'] ?? null,
                'sexe' => $validated['sexe'] ?? null,
                'robe' => $validated['robe'] ?? null,
                'annee_naissance' => $validated['annee_naissance'] ?? null,
                'date_naissance' => $validated['date_naissance'] ?? null,
                'lieu_naissance' => $validated['lieu_naissance'] ?? null,
                'sire_numero' => $validated['sire_numero'] ?? null,
                'ueln_numero' => $validated['ueln_numero'] ?? null,
                'studbook_naissance' => $validated['studbook_naissance'] ?? null,
                'transpondeur' => isset($validated['transpondeur']) ? (int) $validated['transpondeur'] : null,
                'numero_transpondeur' => $validated['numero_transpondeur'] ?? null,
                'date_pose_transpondeur' => $validated['date_pose_transpondeur'] ?? null,
                'taille' => $validated['taille'] ?? null,
            ];

            $horse = Horse::create($horseData);

            $upsertPedigree = function (string $type, string $prefix) use ($validated, $horse) {
                $nom = $validated["{$prefix}_nom"] ?? null;
                $sire = $validated["{$prefix}_sire_numero"] ?? null;
                $ueln = $validated["{$prefix}_ueln_numero"] ?? null;
                $date = $validated["{$prefix}_date_naissance"] ?? null;
                $pays = $validated["{$prefix}_pays_naissance"] ?? null;
                $studbook = $validated["{$prefix}_studbook"] ?? null;

                if (!$nom && !$sire && !$ueln && !$date && !$pays && !$studbook) {
                    return;
                }

                DB::table('chevaux_complet.pedigrees')->updateOrInsert(
                    ['cheval_id' => $horse->id, 'type' => $type],
                    [
                        'nom' => $nom,
                        'sire_numero' => $sire,
                        'ueln_numero' => $ueln,
                        'date_naissance' => $date,
                        'pays_naissance' => $pays,
                        'studbook' => $studbook,
                    ]
                );
            };

            $upsertPedigree('pere', 'pere');
            $upsertPedigree('mere', 'mere');

            $naisseurNom = $validated['naisseur_nom'] ?? null;
            $naisseurAdresse = $validated['naisseur_adresse'] ?? null;
            $naisseurTelephone = $validated['naisseur_telephone'] ?? null;

            if ($naisseurNom || $naisseurAdresse || $naisseurTelephone) {
                $naisseurId = DB::table('chevaux_complet.naisseurs')->insertGetId([
                    'nom' => $naisseurNom ?: 'Naisseur non renseigne',
                    'adresse' => $naisseurAdresse,
                    'telephone' => $naisseurTelephone,
                ]);

                DB::table('chevaux_complet.cheval_naisseur')->updateOrInsert(
                    ['cheval_id' => $horse->id, 'naisseur_id' => $naisseurId],
                    ['pourcentage' => 100]
                );
            }

            return $horse;
        });

        return response()->json($horse, 201);
    }

    public function destroy($id)
    {
        $horse = Horse::findOrFail($id);
        $horse->delete();

        return response()->json([
            'message' => 'Cheval supprime avec succes',
        ]);
    }

    public function show($id)
    {
        $horse = Horse::findOrFail($id);

        $pere = DB::table('chevaux_complet.pedigrees')
            ->where('cheval_id', $horse->id)
            ->where('type', 'pere')
            ->first();

        $mere = DB::table('chevaux_complet.pedigrees')
            ->where('cheval_id', $horse->id)
            ->where('type', 'mere')
            ->first();

        $naisseur = DB::table('chevaux_complet.cheval_naisseur as cn')
            ->join('chevaux_complet.naisseurs as n', 'n.id', '=', 'cn.naisseur_id')
            ->where('cn.cheval_id', $horse->id)
            ->orderByDesc('cn.pourcentage')
            ->select('n.*', 'cn.pourcentage')
            ->first();

        return response()->json([
            'id' => $horse->id,
            'nom' => $horse->nom,
            'race' => $horse->race,
            'sexe' => $horse->sexe,
            'robe' => $horse->robe,
            'annee_naissance' => $horse->annee_naissance,
            'date_naissance' => $horse->date_naissance,
            'lieu_naissance' => $horse->lieu_naissance,
            'sire_numero' => $horse->sire_numero,
            'ueln_numero' => $horse->ueln_numero,
            'studbook_naissance' => $horse->studbook_naissance,
            'transpondeur' => $horse->transpondeur,
            'numero_transpondeur' => $horse->numero_transpondeur,
            'date_pose_transpondeur' => $horse->date_pose_transpondeur,
            'taille' => $horse->taille,

            'pere_nom' => $pere->nom ?? null,
            'pere_sire_numero' => $pere->sire_numero ?? null,
            'pere_ueln_numero' => $pere->ueln_numero ?? null,
            'pere_date_naissance' => $pere->date_naissance ?? null,
            'pere_pays_naissance' => $pere->pays_naissance ?? null,
            'pere_studbook' => $pere->studbook ?? null,

            'mere_nom' => $mere->nom ?? null,
            'mere_sire_numero' => $mere->sire_numero ?? null,
            'mere_ueln_numero' => $mere->ueln_numero ?? null,
            'mere_date_naissance' => $mere->date_naissance ?? null,
            'mere_pays_naissance' => $mere->pays_naissance ?? null,
            'mere_studbook' => $mere->studbook ?? null,

            'naisseur_nom' => $naisseur->nom ?? null,
            'naisseur_adresse' => $naisseur->adresse ?? null,
            'naisseur_telephone' => $naisseur->telephone ?? null,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            // Cheval
            'nom' => 'required|string|max:150',
            'race' => 'nullable|string|max:100',
            'sexe' => 'nullable|string|max:20',
            'robe' => 'nullable|string|max:50',
            'annee_naissance' => 'nullable|integer|min:1900|max:2100',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:150',
            'sire_numero' => 'nullable|string|max:20',
            'ueln_numero' => 'nullable|string|max:30',
            'studbook_naissance' => 'nullable|string|max:150',
            'transpondeur' => 'nullable|in:0,1',
            'numero_transpondeur' => 'nullable|string|max:30',
            'date_pose_transpondeur' => 'nullable|date',
            'taille' => 'nullable|numeric',

            // Pedigree
            'pere_nom' => 'nullable|string|max:150',
            'pere_sire_numero' => 'nullable|string|max:20',
            'pere_ueln_numero' => 'nullable|string|max:30',
            'pere_date_naissance' => 'nullable|date',
            'pere_pays_naissance' => 'nullable|string|max:100',
            'pere_studbook' => 'nullable|string|max:150',

            'mere_nom' => 'nullable|string|max:150',
            'mere_sire_numero' => 'nullable|string|max:20',
            'mere_ueln_numero' => 'nullable|string|max:30',
            'mere_date_naissance' => 'nullable|date',
            'mere_pays_naissance' => 'nullable|string|max:100',
            'mere_studbook' => 'nullable|string|max:150',

            // Naisseur
            'naisseur_nom' => 'nullable|string|max:200',
            'naisseur_adresse' => 'nullable|string',
            'naisseur_telephone' => 'nullable|string|max:30',
        ]);

        $horse = DB::transaction(function () use ($validated, $id) {
            $horse = Horse::findOrFail($id);
            $horse->update([
                'nom' => $validated['nom'],
                'race' => $validated['race'] ?? null,
                'sexe' => $validated['sexe'] ?? null,
                'robe' => $validated['robe'] ?? null,
                'annee_naissance' => $validated['annee_naissance'] ?? null,
                'date_naissance' => $validated['date_naissance'] ?? null,
                'lieu_naissance' => $validated['lieu_naissance'] ?? null,
                'sire_numero' => $validated['sire_numero'] ?? null,
                'ueln_numero' => $validated['ueln_numero'] ?? null,
                'studbook_naissance' => $validated['studbook_naissance'] ?? null,
                'transpondeur' => isset($validated['transpondeur']) ? (int) $validated['transpondeur'] : null,
                'numero_transpondeur' => $validated['numero_transpondeur'] ?? null,
                'date_pose_transpondeur' => $validated['date_pose_transpondeur'] ?? null,
                'taille' => $validated['taille'] ?? null,
            ]);

            $upsertPedigree = function (string $type, string $prefix) use ($validated, $horse) {
                $nom = $validated["{$prefix}_nom"] ?? null;
                $sire = $validated["{$prefix}_sire_numero"] ?? null;
                $ueln = $validated["{$prefix}_ueln_numero"] ?? null;
                $date = $validated["{$prefix}_date_naissance"] ?? null;
                $pays = $validated["{$prefix}_pays_naissance"] ?? null;
                $studbook = $validated["{$prefix}_studbook"] ?? null;

                if (!$nom && !$sire && !$ueln && !$date && !$pays && !$studbook) {
                    return;
                }

                DB::table('chevaux_complet.pedigrees')->updateOrInsert(
                    ['cheval_id' => $horse->id, 'type' => $type],
                    [
                        'nom' => $nom,
                        'sire_numero' => $sire,
                        'ueln_numero' => $ueln,
                        'date_naissance' => $date,
                        'pays_naissance' => $pays,
                        'studbook' => $studbook,
                    ]
                );
            };

            $upsertPedigree('pere', 'pere');
            $upsertPedigree('mere', 'mere');

            $naisseurNom = $validated['naisseur_nom'] ?? null;
            $naisseurAdresse = $validated['naisseur_adresse'] ?? null;
            $naisseurTelephone = $validated['naisseur_telephone'] ?? null;

            if ($naisseurNom || $naisseurAdresse || $naisseurTelephone) {
                $existingLink = DB::table('chevaux_complet.cheval_naisseur')
                    ->where('cheval_id', $horse->id)
                    ->first();

                if ($existingLink) {
                    DB::table('chevaux_complet.naisseurs')
                        ->where('id', $existingLink->naisseur_id)
                        ->update([
                            'nom' => $naisseurNom ?: 'Naisseur non renseigne',
                            'adresse' => $naisseurAdresse,
                            'telephone' => $naisseurTelephone,
                        ]);
                } else {
                    $naisseurId = DB::table('chevaux_complet.naisseurs')->insertGetId([
                        'nom' => $naisseurNom ?: 'Naisseur non renseigne',
                        'adresse' => $naisseurAdresse,
                        'telephone' => $naisseurTelephone,
                    ]);

                    DB::table('chevaux_complet.cheval_naisseur')->updateOrInsert(
                        ['cheval_id' => $horse->id, 'naisseur_id' => $naisseurId],
                        ['pourcentage' => 100]
                    );
                }
            }

            return $horse;
        });

        return response()->json([
            'message' => 'Cheval mis a jour avec succes',
            'horse' => $horse,
        ]);
    }

    public function userIndex()
    {
        $horses = Horse::query()
            ->selectRaw("
                id,
                nom,
                race,
                robe,
                sexe,
                taille,
                COALESCE(annee_naissance, YEAR(date_naissance)) as annee_naissance,
                CASE
                    WHEN annee_naissance IS NOT NULL THEN YEAR(CURDATE()) - annee_naissance
                    WHEN date_naissance IS NOT NULL THEN TIMESTAMPDIFF(YEAR, date_naissance, CURDATE())
                    ELSE NULL
                END as age
            ")
            ->get();

        return view('user.user', compact('horses'));
    }

    public function userFavorites()
    {
        $horses = Horse::query()
            ->selectRaw("
                id,
                nom,
                race,
                robe,
                sexe,
                taille,
                COALESCE(annee_naissance, YEAR(date_naissance)) as annee_naissance,
                CASE
                    WHEN annee_naissance IS NOT NULL THEN YEAR(CURDATE()) - annee_naissance
                    WHEN date_naissance IS NOT NULL THEN TIMESTAMPDIFF(YEAR, date_naissance, CURDATE())
                    ELSE NULL
                END as age
            ")
            ->get();

        return view('user.favorites', compact('horses'));
    }

    public function userShow($id)
    {
        $qualifiedTable = 'chevaux_complet.chevaux';

        $cheval = DB::table($qualifiedTable)->where('id', $id)->first();

        if (!$cheval) {
            $sourceHorse = Horse::find($id);
            if ($sourceHorse && !empty($sourceHorse->nom)) {
                $cheval = DB::table($qualifiedTable)->where('nom', $sourceHorse->nom)->first();
            }
        }

        if (!$cheval) {
            abort(404, 'Cheval introuvable dans la base chevaux_complet.');
        }

        $pere = DB::table('chevaux_complet.pedigrees')
            ->where('cheval_id', $cheval->id)
            ->where('type', 'pere')
            ->first();

        $mere = DB::table('chevaux_complet.pedigrees')
            ->where('cheval_id', $cheval->id)
            ->where('type', 'mere')
            ->first();

        $naisseur = DB::table('chevaux_complet.cheval_naisseur as cn')
            ->join('chevaux_complet.naisseurs as n', 'n.id', '=', 'cn.naisseur_id')
            ->where('cn.cheval_id', $cheval->id)
            ->orderByDesc('cn.pourcentage')
            ->select('n.*', 'cn.pourcentage')
            ->first();

        return view('user.horse-profile', compact('cheval', 'pere', 'mere', 'naisseur'));
    }
}
