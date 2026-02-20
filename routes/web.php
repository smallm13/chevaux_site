<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminChevalController;
use App\Http\Controllers\HorseController;



Route::get('/', function () {
    return view('welcome');
});
Route::get('/csrf-token', function (Request $request) {
    $request->session()->regenerateToken();
    return response()->json(['csrf_token' => csrf_token()]);
})->name('csrf.token');

Route::post('/users', [UserController::class, 'store']);
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
//Route::get('/utilisateurs', [AdminUserController::class, 'index']);
Route::get('/utilisateurs/count', [AdminUserController::class, 'count']);
Route::get('/admin/chevaux/count', [AdminChevalController::class, 'count'])->middleware('auth');

//Route::get('/utilisateur', function () {
//  return view('user.user');
//});


Route::get('/horses', [HorseController::class, 'index']);
Route::get('/horses/search', [HorseController::class, 'search']); // usage : /api/horses/search?q=motcle
Route::get('/horses/stats', [HorseController::class, 'stats']);
// Ajouter un cheval
Route::post('/horses', [HorseController::class, 'store']);

Route::get('/admin', function () {
    return view('admin.index');
})->middleware('auth')->name('admin.dashboard');

Route::delete('/admin/chevaux/{id}', [HorseController::class, 'destroy'])->middleware('auth')->whereNumber('id');
Route::get('/admin/chevaux/{id}', [HorseController::class, 'show'])->middleware('auth')->whereNumber('id');
Route::put('/admin/chevaux/{id}', [HorseController::class, 'update'])->middleware('auth')->whereNumber('id');

Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/chevaux', [AdminChevalController::class, 'index'])->name('admin.chevaux.index');
    Route::get('/chevaux/list', [AdminChevalController::class, 'getChevaux']);

    Route::get('/utilisateurs', [UserController::class, 'index']);
    Route::get('/utilisateurs/{id}', [UserController::class, 'show']);
    Route::put('/utilisateurs/{id}', [UserController::class, 'update']);
    Route::delete('/utilisateurs/{id}', [UserController::class, 'destroy']);

});
Route::get('/utilisateurs', [HorseController::class, 'userIndex'])->name('user.horses');
Route::get('/utilisateur', [HorseController::class, 'userIndex'])
    ->name('user.horses');
Route::get('/utilisateur/favoris', [HorseController::class, 'userFavorites'])
    ->name('user.favorites');
Route::get('/utilisateur/chevaux/{id}', [HorseController::class, 'userShow'])
    ->name('user.horse.profile');
