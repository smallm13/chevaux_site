<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chevaux', function (Blueprint $table) {
            if (!Schema::hasColumn('chevaux', 'discipline')) {
                $table->string('discipline')->nullable();
            }
            if (Schema::hasColumn('chevaux', 'taille')) {
                $table->dropColumn('taille');
            }
        });
    }

    public function down(): void
    {
        Schema::table('chevaux', function (Blueprint $table) {
            if (Schema::hasColumn('chevaux', 'discipline')) {
                $table->dropColumn('discipline');
            }
            if (!Schema::hasColumn('chevaux', 'taille')) {
                $table->decimal('taille', 5, 2)->nullable();
            }
        });
    }
};
