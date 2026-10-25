<?php

use Illuminate\Support\Facades\Route;

Route::get('/storage/{any}', function () {
    abort(404);
})->where('any', '.*');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
