<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Maria',
            'email' => 'maria@goldengym.com',
            'password' => Hash::make('M123__123'),
        ]);

        $this->call([
            TemplateKeysSeeder::class,
        ]);
    }
}
