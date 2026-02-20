<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cheval extends Model
{
    use HasFactory;

    // ✅ Forcer le nom de la table
    protected $table = 'chevaux_complet.chevaux';

    // ✅ Colonnes qu’on peut remplir via create() ou update()
    protected $fillable = [
        'nom',
        'race',
        'sexe',
        'robe',
        'annee_naissance',
        'date_naissance',
        'taille',
        'lieu_naissance',
        'sire_numero',
        'ueln_numero',
        'studbook_naissance',
        'transpondeur',
        'numero_transpondeur',
        'date_pose_transpondeur',
    ];
}
