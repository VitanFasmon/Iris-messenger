<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MessageCleanupTest extends TestCase
{
    use RefreshDatabase;

    protected function createUser($username, $email)
    {
        return User::create([
            'username' => $username,
            'email' => $email,
            'password_hash' => Hash::make('password123'),
        ]);
    }

    /** @test */
    public function command_marks_expired_messages_as_deleted()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create an expired message
        $expiredMessage = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'This message has expired',
            'delete_after' => 60,
            'expires_at' => now()->subMinutes(5),
            'is_deleted' => false,
        ]);

        // Create a message that will expire in the future
        $futureMessage = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'This message will expire later',
            'delete_after' => 300,
            'expires_at' => now()->addMinutes(5),
            'is_deleted' => false,
        ]);

        // Create a message with no expiry
        $permanentMessage = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'This message never expires',
            'is_deleted' => false,
        ]);

        // Run the cleanup command
        Artisan::call('messages:delete-expired');

        // Expired message should be marked as deleted
        $this->assertDatabaseHas('messages', [
            'id' => $expiredMessage->id,
            'is_deleted' => true,
        ]);

        // Future message should still be active
        $this->assertDatabaseHas('messages', [
            'id' => $futureMessage->id,
            'is_deleted' => false,
        ]);

        // Permanent message should still be active
        $this->assertDatabaseHas('messages', [
            'id' => $permanentMessage->id,
            'is_deleted' => false,
        ]);
    }

    /** @test */
    public function command_handles_no_expired_messages_gracefully()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Active message',
            'is_deleted' => false,
        ]);

        $exitCode = Artisan::call('messages:delete-expired');

        $this->assertEquals(0, $exitCode);
    }

    /** @test */
    public function command_does_not_affect_already_deleted_messages()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $deletedMessage = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Already deleted',
            'delete_after' => 60,
            'expires_at' => now()->subMinutes(10),
            'is_deleted' => true,
        ]);

        Artisan::call('messages:delete-expired');

        // Message should still be deleted (not double-processed)
        $this->assertDatabaseHas('messages', [
            'id' => $deletedMessage->id,
            'is_deleted' => true,
        ]);
    }

    /** @test */
    public function expired_scope_returns_only_expired_messages()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Expired message
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Expired',
            'delete_after' => 60,
            'expires_at' => now()->subMinutes(5),
            'is_deleted' => false,
        ]);

        // Future message
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Future',
            'delete_after' => 300,
            'expires_at' => now()->addMinutes(5),
            'is_deleted' => false,
        ]);

        // No expiry
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Permanent',
            'is_deleted' => false,
        ]);

        $expiredMessages = Message::expired()->get();

        $this->assertCount(1, $expiredMessages);
        $this->assertEquals('Expired', $expiredMessages->first()->content);
    }

    /** @test */
    public function active_scope_returns_only_non_deleted_messages()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Active',
            'is_deleted' => false,
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Deleted',
            'is_deleted' => true,
        ]);

        $activeMessages = Message::active()->get();

        $this->assertCount(1, $activeMessages);
        $this->assertEquals('Active', $activeMessages->first()->content);
    }
}
