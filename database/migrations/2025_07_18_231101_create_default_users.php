<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')->insert([
            'name' => 'Maria',
            'email' => 'maria@goldengym.com',
            'password' => Hash::make('M123#654'),
        ]);

        DB::table('users')->insert([
            'name' => 'Miguel',
            'email' => 'migueldescon@gmail.com',
            'password' => Hash::make('M123__123'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')->where('email', 'maria@goldengym.com')->delete();
        DB::table('users')->where('email', 'migueldescon@gmail.com')->delete();
    }
};
