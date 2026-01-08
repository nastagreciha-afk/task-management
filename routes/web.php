<?php

use Illuminate\Support\Facades\Route;

// Serve frontend HTML files
Route::get('/', function () {
    return response()->file(public_path('index.html'));
});

Route::get('/login.html', function () {
    return response()->file(public_path('login.html'));
});

Route::get('/index.html', function () {
    return response()->file(public_path('index.html'));
});
