<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horse extends Model
{
    use HasFactory;

    // Nom de la table
    protected $table = 'chevaux';

    // Colonnes modifiables (utile si tu fais des insert/update plus tard)
    protected $fillable = [
        'nom',
        'race',
        'robe',
        'age',
        'taille',
        'proprietaire'
    ];
}
