<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'fileable_id',
        'fileable_type',
        'name',
        'path',
        'mime_type',
        'size',
        'type',
    ];

    protected $appends = ['url'];

    // Relación polimórfica
    public function fileable()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeProfilePhotos($query)
    {
        return $query->where('type', 'profile_photo');
    }

    public function scopeDocuments($query)
    {
        return $query->where('type', 'document');
    }

    public function getUrlAttribute()
    {
        if (env('APP_ENV') === 'production') {
            return Storage::disk('s3')->temporaryUrl($this->path, now()->addHours(24));
        }
        return str_replace("http://localhost", "http://localhost:8070", Storage::url($this->path));
    }

    public function getUrl()
    {
        return $this->url;
    }

    public function getFullPath()
    {
        return Storage::path($this->path);
    }

    public function getSizeFormatted()
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function delete()
    {
        // Eliminar archivo físico
        if (Storage::exists($this->path)) {
            Storage::delete($this->path);
        }

        return parent::delete();
    }
}
