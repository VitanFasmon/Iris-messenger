<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Friend extends Model
{
    use HasFactory;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'friend_id',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * User who initiated the friendship
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * User who received the friend request
     */
    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }
}
