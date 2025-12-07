<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Common filters for unread counts and last messages
            if (!Schema::hasColumn('messages', 'receiver_id')) {
                return; // safety: skip if table not present in this environment
            }
            $table->index(['receiver_id', 'is_deleted'], 'messages_receiver_deleted_idx');
            $table->index('sender_id', 'messages_sender_idx');
            $table->index('expires_at', 'messages_expires_idx');
            $table->index('timestamp', 'messages_timestamp_idx');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex('messages_receiver_deleted_idx');
            $table->dropIndex('messages_sender_idx');
            $table->dropIndex('messages_expires_idx');
            $table->dropIndex('messages_timestamp_idx');
        });
    }
};

