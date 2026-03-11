<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chevaux', function (Blueprint $table) {
            $table->string('carnet_sante_photo')->nullable()->after('date_pose_transpondeur');
        });
    }

    public function down(): void
    {
        Schema::table('chevaux', function (Blueprint $table) {
            $table->dropColumn('carnet_sante_photo');
        });
    }
};
