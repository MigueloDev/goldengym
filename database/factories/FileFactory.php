<?php

namespace Database\Factories;

use App\Models\File;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\File>
 */
class FileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fileTypes = ['profile_photo', 'document', 'payment_evidence', 'medical_record'];
        $mimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        $mimeType = fake()->randomElement($mimeTypes);
        $extension = $this->getExtensionFromMimeType($mimeType);
        $fileName = fake()->word() . '.' . $extension;

        return [
            'name' => $fileName,
            'path' => 'files/' . fake()->uuid() . '.' . $extension,
            'mime_type' => $mimeType,
            'size' => fake()->numberBetween(1024, 10485760), // 1KB to 10MB
            'type' => fake()->randomElement($fileTypes),
            'fileable_id' => Client::factory(),
            'fileable_type' => Client::class,
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Indicate that the file is a profile photo.
     */
    public function profilePhoto(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'profile_photo',
            'mime_type' => fake()->randomElement(['image/jpeg', 'image/png', 'image/gif']),
        ]);
    }

    /**
     * Indicate that the file is a document.
     */
    public function document(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'document',
            'mime_type' => fake()->randomElement(['application/pdf', 'application/msword']),
        ]);
    }

    /**
     * Indicate that the file is a payment evidence.
     */
    public function paymentEvidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'payment_evidence',
            'mime_type' => fake()->randomElement(['image/jpeg', 'image/png', 'application/pdf']),
        ]);
    }

    /**
     * Get file extension from MIME type.
     */
    private function getExtensionFromMimeType(string $mimeType): string
    {
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx'
        ];

        return $extensions[$mimeType] ?? 'txt';
    }
}
