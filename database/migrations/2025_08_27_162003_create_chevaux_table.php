<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chevaux', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('race')->nullable();
            $table->string('robe')->nullable();
            $table->integer('age')->nullable();
            $table->string('discipline')->nullable();
            $table->integer('proprietaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chevaux');
    }
};
