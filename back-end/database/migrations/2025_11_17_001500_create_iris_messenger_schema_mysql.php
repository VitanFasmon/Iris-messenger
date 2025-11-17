<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // SERIAL equivalent in MySQL
            $table->increments('id');
            $table->string('username', 50)->unique(); // not null
            $table->string('email', 100)->unique()->nullable(); // optional
            $table->text('password_hash'); // not null
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('friends', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('friend_id');
            $table->string('status', 20)->nullable(); // pending / accepted
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('friend_id')->references('id')->on('users');
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('sender_id');
            $table->unsignedInteger('receiver_id');
            $table->text('content')->nullable();
            $table->text('file_url')->nullable();
            $table->timestamp('timestamp')->useCurrent();
            // MySQL doesn't have an INTERVAL column type; store seconds instead
            $table->unsignedInteger('delete_after')->nullable()->comment('DBML INTERVAL mapped to seconds');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_deleted')->default(false);

            $table->foreign('sender_id')->references('id')->on('users');
            $table->foreign('receiver_id')->references('id')->on('users');
        });

        Schema::create('attachments', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('message_id');
            $table->string('file_type', 20)->nullable(); // image / video / audio / file
            $table->text('file_url')->nullable();

            $table->foreign('message_id')->references('id')->on('messages');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('friends');
        Schema::dropIfExists('users');
    }
};
