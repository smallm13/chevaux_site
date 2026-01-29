<?php

namespace App\Http\Controllers;

use App\Models\Cheval;
use Illuminate\Http\Request;

class AdminChevalController extends Controller
{
    // Liste des chevaux
    public function index()
    {
        $chevaux = Cheval::all();
        return view('admin.chevaux.index', compact('chevaux'));
    }
    public function getChevaux()
    {
        return response()->json(Cheval::all());
    }
    public function count()
    {
        return response()->json(['count' => Cheval::count()]);
    }




}
