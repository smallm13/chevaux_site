<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chevaux', function (Blueprint $table) {
            $table->text('signalement_tete')->nullable();
            $table->text('signalement_anterieur_gauche')->nullable();
            $table->text('signalement_anterieur_droite')->nullable();
            $table->text('signalement_posterieur_gauche')->nullable();
            $table->text('signalement_posterieur_droite')->nullable();
            $table->text('signalement_corps')->nullable();
            $table->text('signalement_marques_particulieres')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('chevaux', function (Blueprint $table) {
            $table->dropColumn([
                'signalement_tete',
                'signalement_anterieur_gauche',
                'signalement_anterieur_droite',
                'signalement_posterieur_gauche',
                'signalement_posterieur_droite',
                'signalement_corps',
                'signalement_marques_particulieres',
            ]);
        });
    }
};
