<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminChevalController;
use App\Http\Controllers\HorseController;



Route::get('/', function () {
    return view('welcome');
});
Route::post('/users', [UserController::class, 'store']);
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
Route::get('/utilisateurs', [AdminUserController::class, 'index']);
Route::get('/admin/chevaux', [AdminChevalController::class, 'index'])->name('admin.chevaux.index');
Route::get('/admin/chevaux/list', [AdminChevalController::class, 'getChevaux']);
Route::get('/utilisateurs/count', [AdminUserController::class, 'count']);
Route::get('/admin/chevaux/count', [AdminChevalController::class, 'count']);

Route::get('/utilisateur', function () {
    return view('user.user');
});


Route::get('/horses', [HorseController::class, 'index']);
Route::get('/horses/search', [HorseController::class, 'search']); // usage : /api/horses/search?q=motcle
Route::get('/horses/stats', [HorseController::class, 'stats']);
// Ajouter un cheval
Route::post('/horses', [HorseController::class, 'store']);


Route::get('/admin', function () {
    return view('admin.index');
})->name('admin.dashboard');
Route::delete('/admin/chevaux/{id}', [HorseController::class, 'destroy']);

Route::get('/admin/chevaux/{id}', [HorseController::class, 'show']);
Route::put('/admin/chevaux/{id}', [HorseController::class, 'update']);
Route::middleware(['auth'])->prefix('admin')->group(function () {

    Route::get('/utilisateurs', [UserController::class, 'index']);
    Route::get('/utilisateurs/{id}', [UserController::class, 'show']);
    Route::put('/utilisateurs/{id}', [UserController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UserController::class, 'destroy']);

});
