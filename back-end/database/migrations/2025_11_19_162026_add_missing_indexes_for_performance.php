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
        // Most indexes already exist from foreign keys and unique constraints
        // Only adding missing indexes that provide significant performance benefits
        
        Schema::table('messages', function (Blueprint $table) {
            // Composite index for conversation queries (most common query pattern)
            $table->index(['sender_id', 'receiver_id', 'timestamp'], 'messages_conversation_index');
            // Index on expires_at for cleanup scheduler command
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_conversation_index');
            $table->dropIndex(['expires_at']);
        });
    }
};
