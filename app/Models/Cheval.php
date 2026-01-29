<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cheval extends Model
{
    use HasFactory;

    // ✅ Forcer le nom de la table
    protected $table = 'chevaux';

    // ✅ Colonnes qu’on peut remplir via create() ou update()
    protected $fillable = [
        'nom',
        'race',
        'robe',
        'age',
        'taille',
        'proprietaire',
    ];
}
