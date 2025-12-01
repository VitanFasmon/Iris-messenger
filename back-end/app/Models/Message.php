<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    const CREATED_AT = 'timestamp';
    const UPDATED_AT = null;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'file_url',
        'filename',
        'delete_after',
        'expires_at',
        'is_deleted',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'expires_at' => 'datetime',
        'is_deleted' => 'boolean',
        'delete_after' => 'integer',
    ];

    protected $attributes = [
        'is_deleted' => false,
    ];

    /**
     * Sender of the message
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Receiver of the message
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Attachments for this message
     */
    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    /**
     * Read records for this message
     */
    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }

    /**
     * Scope to get non-deleted messages
     */
    public function scopeActive($query)
    {
        return $query->where('is_deleted', false);
    }

    /**
     * Scope to get expired messages
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now())
                     ->where('is_deleted', false);
    }
}
