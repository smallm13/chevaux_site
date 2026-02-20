<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horse extends Model
{
    use HasFactory;

    // Table source: base chevaux_complet
    protected $table = 'chevaux_complet.chevaux';

    // Colonnes modifiables reelles de chevaux_complet.chevaux
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
