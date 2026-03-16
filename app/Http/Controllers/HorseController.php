<?php

namespace App\Http\Controllers;

use App\Models\Horse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class HorseController extends Controller
{
    private ?array $horseColumns = null;
    private array $tableExistsCache = [];

    private function horseColumns(): array
    {
        if ($this->horseColumns !== null) {
            return $this->horseColumns;
        }

        $model = new Horse();
        $this->horseColumns = Schema::connection($model->getConnectionName())
            ->getColumnListing($model->getTable());

        return $this->horseColumns;
    }

    private function hasHorseColumn(string $column): bool
    {
        return in_array($column, $this->horseColumns(), true);
    }

    private function hasTable(string $table): bool
    {
        if (array_key_exists($table, $this->tableExistsCache)) {
            return $this->tableExistsCache[$table];
        }

        $model = new Horse();
        $exists = Schema::connection($model->getConnectionName())->hasTable($table);
        $this->tableExistsCache[$table] = $exists;

        return $exists;
    }

    private function resolveBirthYear(?int $anneeNaissance, $dateNaissance): ?int
    {
        if ($anneeNaissance !== null) {
            return $anneeNaissance;
        }

        if (empty($dateNaissance)) {
            return null;
        }

        return Carbon::parse($dateNaissance)->year;
    }

    private function resolveAge(?int $birthYear): ?int
    {
        if ($birthYear === null) {
            return null;
        }

        return now()->year - $birthYear;
    }

    private function formatHorseListItem(object $horse): array
    {
        $birthYear = $this->resolveBirthYear($horse->annee_naissance, $horse->date_naissance);
        $age = $birthYear !== null ? $this->resolveAge($birthYear) : ($horse->stored_age ?? null);

        return [
            'name' => $horse->name,
            'breed' => $horse->breed,
            'coat' => $horse->coat,
            'sex' => $horse->sex ?? null,
            'birth_year' => $birthYear,
            'age' => $age,
            'discipline' => $horse->discipline ?? null,
        ];
    }

    private function horseListQuery()
    {
        $query = Horse::query()->select([
            'nom as name',
            'race as breed',
            'robe as coat',
            'discipline',
        ]);

        if ($this->hasHorseColumn('sexe')) {
            $query->addSelect('sexe as sex');
        } else {
            $query->selectRaw('NULL as sex');
        }

        if ($this->hasHorseColumn('annee_naissance')) {
            $query->addSelect('annee_naissance');
        } else {
            $query->selectRaw('NULL as annee_naissance');
        }

        if ($this->hasHorseColumn('date_naissance')) {
            $query->addSelect('date_naissance');
        } else {
            $query->selectRaw('NULL as date_naissance');
        }

        if ($this->hasHorseColumn('age')) {
            $query->addSelect('age as stored_age');
        } else {
            $query->selectRaw('NULL as stored_age');
        }

        return $query;
    }

    private function horseViewQuery()
    {
        $query = Horse::query()->select([
            'id',
            'nom',
            'race',
            'robe',
            'discipline',
        ]);

        if ($this->hasHorseColumn('sexe')) {
            $query->addSelect('sexe');
        } else {
            $query->selectRaw('NULL as sexe');
        }

        if ($this->hasHorseColumn('annee_naissance')) {
            $query->addSelect('annee_naissance');
        } else {
            $query->selectRaw('NULL as annee_naissance');
        }

        if ($this->hasHorseColumn('date_naissance')) {
            $query->addSelect('date_naissance');
        } else {
            $query->selectRaw('NULL as date_naissance');
        }

        if ($this->hasHorseColumn('age')) {
            $query->addSelect('age as stored_age');
        } else {
            $query->selectRaw('NULL as stored_age');
        }

        if ($this->hasHorseColumn('carnet_sante_photo')) {
            $query->addSelect('carnet_sante_photo');
        } else {
            $query->selectRaw('NULL as carnet_sante_photo');
        }

        return $query;
    }

    public function index()
    {
        $horses = $this->horseListQuery()
            ->get()
            ->map(fn ($horse) => $this->formatHorseListItem($horse))
            ->values();

        return response()->json($horses);
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
            ->get()
            ->map(fn ($horse) => $this->formatHorseListItem($horse))
            ->values();

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
            'discipline' => 'nullable|string|max:100',
            'carnet_sante_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'signalement_tete' => 'nullable|string',
            'signalement_anterieur_gauche' => 'nullable|string',
            'signalement_anterieur_droite' => 'nullable|string',
            'signalement_posterieur_gauche' => 'nullable|string',
            'signalement_posterieur_droite' => 'nullable|string',
            'signalement_corps' => 'nullable|string',
            'signalement_marques_particulieres' => 'nullable|string',

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

        $horse = DB::transaction(function () use ($validated, $request) {
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
                'discipline' => $validated['discipline'] ?? null,
                'signalement_tete' => $validated['signalement_tete'] ?? null,
                'signalement_anterieur_gauche' => $validated['signalement_anterieur_gauche'] ?? null,
                'signalement_anterieur_droite' => $validated['signalement_anterieur_droite'] ?? null,
                'signalement_posterieur_gauche' => $validated['signalement_posterieur_gauche'] ?? null,
                'signalement_posterieur_droite' => $validated['signalement_posterieur_droite'] ?? null,
                'signalement_corps' => $validated['signalement_corps'] ?? null,
                'signalement_marques_particulieres' => $validated['signalement_marques_particulieres'] ?? null,
            ];

            if ($request->hasFile('carnet_sante_photo') && $this->hasHorseColumn('carnet_sante_photo')) {
                $horseData['carnet_sante_photo'] = $request->file('carnet_sante_photo')
                    ->store('chevaux/carnets', 'public');
            }

            $horseData = array_intersect_key($horseData, array_flip($this->horseColumns()));

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

                if ($this->hasTable('pedigrees')) {
                    DB::table('pedigrees')->updateOrInsert(
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
                }
            };

            $upsertPedigree('pere', 'pere');
            $upsertPedigree('mere', 'mere');

            $naisseurNom = $validated['naisseur_nom'] ?? null;
            $naisseurAdresse = $validated['naisseur_adresse'] ?? null;
            $naisseurTelephone = $validated['naisseur_telephone'] ?? null;

            if (($naisseurNom || $naisseurAdresse || $naisseurTelephone) && $this->hasTable('naisseurs') && $this->hasTable('cheval_naisseur')) {
                $naisseurId = DB::table('naisseurs')->insertGetId([
                    'nom' => $naisseurNom ?: 'Naisseur non renseigne',
                    'adresse' => $naisseurAdresse,
                    'telephone' => $naisseurTelephone,
                ]);

                DB::table('cheval_naisseur')->updateOrInsert(
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

        $pere = null;
        $mere = null;
        $naisseur = null;

        if ($this->hasTable('pedigrees')) {
            $pere = DB::table('pedigrees')
                ->where('cheval_id', $horse->id)
                ->where('type', 'pere')
                ->first();

            $mere = DB::table('pedigrees')
                ->where('cheval_id', $horse->id)
                ->where('type', 'mere')
                ->first();
        }

        if ($this->hasTable('cheval_naisseur') && $this->hasTable('naisseurs')) {
            $naisseur = DB::table('cheval_naisseur as cn')
                ->join('naisseurs as n', 'n.id', '=', 'cn.naisseur_id')
                ->where('cn.cheval_id', $horse->id)
                ->orderByDesc('cn.pourcentage')
                ->select('n.*', 'cn.pourcentage')
                ->first();
        }

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
            'discipline' => $horse->discipline,
            'carnet_sante_photo' => $horse->carnet_sante_photo ?? null,
            'signalement_tete' => $horse->signalement_tete ?? null,
            'signalement_anterieur_gauche' => $horse->signalement_anterieur_gauche ?? null,
            'signalement_anterieur_droite' => $horse->signalement_anterieur_droite ?? null,
            'signalement_posterieur_gauche' => $horse->signalement_posterieur_gauche ?? null,
            'signalement_posterieur_droite' => $horse->signalement_posterieur_droite ?? null,
            'signalement_corps' => $horse->signalement_corps ?? null,
            'signalement_marques_particulieres' => $horse->signalement_marques_particulieres ?? null,

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
            'discipline' => 'nullable|string|max:100',
            'carnet_sante_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'signalement_tete' => 'nullable|string',
            'signalement_anterieur_gauche' => 'nullable|string',
            'signalement_anterieur_droite' => 'nullable|string',
            'signalement_posterieur_gauche' => 'nullable|string',
            'signalement_posterieur_droite' => 'nullable|string',
            'signalement_corps' => 'nullable|string',
            'signalement_marques_particulieres' => 'nullable|string',

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

        $horse = DB::transaction(function () use ($validated, $id, $request) {
            $horse = Horse::findOrFail($id);
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
                'discipline' => $validated['discipline'] ?? null,
                'signalement_tete' => $validated['signalement_tete'] ?? null,
                'signalement_anterieur_gauche' => $validated['signalement_anterieur_gauche'] ?? null,
                'signalement_anterieur_droite' => $validated['signalement_anterieur_droite'] ?? null,
                'signalement_posterieur_gauche' => $validated['signalement_posterieur_gauche'] ?? null,
                'signalement_posterieur_droite' => $validated['signalement_posterieur_droite'] ?? null,
                'signalement_corps' => $validated['signalement_corps'] ?? null,
                'signalement_marques_particulieres' => $validated['signalement_marques_particulieres'] ?? null,
            ];

            if ($request->hasFile('carnet_sante_photo') && $this->hasHorseColumn('carnet_sante_photo')) {
                $newPath = $request->file('carnet_sante_photo')->store('chevaux/carnets', 'public');
                $oldPath = $horse->carnet_sante_photo ?? null;
                $horseData['carnet_sante_photo'] = $newPath;
                if ($oldPath) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $horseData = array_intersect_key($horseData, array_flip($this->horseColumns()));
            $horse->update($horseData);

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

                if ($this->hasTable('pedigrees')) {
                    DB::table('pedigrees')->updateOrInsert(
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
                }
            };

            $upsertPedigree('pere', 'pere');
            $upsertPedigree('mere', 'mere');

            $naisseurNom = $validated['naisseur_nom'] ?? null;
            $naisseurAdresse = $validated['naisseur_adresse'] ?? null;
            $naisseurTelephone = $validated['naisseur_telephone'] ?? null;

            if (($naisseurNom || $naisseurAdresse || $naisseurTelephone) && $this->hasTable('naisseurs') && $this->hasTable('cheval_naisseur')) {
                $existingLink = DB::table('cheval_naisseur')
                    ->where('cheval_id', $horse->id)
                    ->first();

                if ($existingLink) {
                    DB::table('naisseurs')
                        ->where('id', $existingLink->naisseur_id)
                        ->update([
                            'nom' => $naisseurNom ?: 'Naisseur non renseigne',
                            'adresse' => $naisseurAdresse,
                            'telephone' => $naisseurTelephone,
                        ]);
                } else {
                    $naisseurId = DB::table('naisseurs')->insertGetId([
                        'nom' => $naisseurNom ?: 'Naisseur non renseigne',
                        'adresse' => $naisseurAdresse,
                        'telephone' => $naisseurTelephone,
                    ]);

                    DB::table('cheval_naisseur')->updateOrInsert(
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
        $horses = $this->horseViewQuery()
            ->get()
            ->map(function ($horse) {
                $birthYear = $this->resolveBirthYear($horse->annee_naissance, $horse->date_naissance);
                $horse->annee_naissance = $birthYear;
                $horse->age = $birthYear !== null ? $this->resolveAge($birthYear) : ($horse->stored_age ?? null);

                return $horse;
            });

        return view('user.user', compact('horses'));
    }

    public function userFavorites()
    {
        $horses = $this->horseViewQuery()
            ->get()
            ->map(function ($horse) {
                $birthYear = $this->resolveBirthYear($horse->annee_naissance, $horse->date_naissance);
                $horse->annee_naissance = $birthYear;
                $horse->age = $birthYear !== null ? $this->resolveAge($birthYear) : ($horse->stored_age ?? null);

                return $horse;
            });

        return view('user.favorites', compact('horses'));
    }

    public function userStats()
    {
        return view('user.stats');
    }

    public function userCarnet($id)
    {
        $cheval = Horse::findOrFail($id);
        $path = $cheval->carnet_sante_photo ?? null;
        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public')->response($path);
    }

    public function userShow($id)
    {
        $cheval = Horse::findOrFail($id);

        $pere = null;
        $mere = null;
        $naisseur = null;

        try {
            $pere = DB::table('pedigrees')
                ->where('cheval_id', $cheval->id)
                ->where('type', 'pere')
                ->first();

            $mere = DB::table('pedigrees')
                ->where('cheval_id', $cheval->id)
                ->where('type', 'mere')
                ->first();
        } catch (QueryException $e) {
            $pere = null;
            $mere = null;
        }

        try {
            $naisseur = DB::table('cheval_naisseur as cn')
                ->join('naisseurs as n', 'n.id', '=', 'cn.naisseur_id')
                ->where('cn.cheval_id', $cheval->id)
                ->orderByDesc('cn.pourcentage')
                ->select('n.*', 'cn.pourcentage')
                ->first();
        } catch (QueryException $e) {
            $naisseur = null;
        }

        return view('user.horse-profile', compact('cheval', 'pere', 'mere', 'naisseur'));
    }
}

