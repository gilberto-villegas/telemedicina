<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Bank::query();
        
        // Si no es admin, solo mostrar bancos activos
        if ($request->user()->type !== 'admin') {
            $query->where('is_active', true);
        }

        return response()->json($query->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->user()->type !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|size:4|unique:banks',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bank = Bank::create($request->all());

        return response()->json([
            'message' => 'Banco creado con éxito',
            'bank' => $bank
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bank $bank)
    {
        if ($request->user()->type !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'code' => 'string|size:4|unique:banks,code,' . $bank->id,
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bank->update($request->all());

        return response()->json([
            'message' => 'Banco actualizado con éxito',
            'bank' => $bank
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Bank $bank)
    {
        if ($request->user()->type !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $bank->delete();

        return response()->json(['message' => 'Banco eliminado con éxito']);
    }
}
