<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'message_id',
        'file_type',
        'file_url',
    ];

    /**
     * Message this attachment belongs to
     */
    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
