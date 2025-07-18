<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'content', 'variables', 'status', 'created_by'];

    protected $casts = [
        'variables' => 'array'
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function files()
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function getVariablesListAttribute()
    {
        return $this->variables ?? [];
    }

    public function getFormattedContentAttribute()
    {
        return $this->content;
    }
}
