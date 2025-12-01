<?php

namespace Tests\Feature;

use App\Models\Friend;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageReadTest extends TestCase
{
    use RefreshDatabase;

    protected $user1;
    protected $user2;
    protected $token1;
    protected $token2;

    protected function setUp(): void
    {
        parent::setUp();

        // Create two users
        $this->user1 = User::factory()->create(['username' => 'alice']);
        $this->user2 = User::factory()->create(['username' => 'bob']);

        // Make them friends
        Friend::create([
            'user_id' => $this->user1->id,
            'friend_id' => $this->user2->id,
            'status' => 'accepted',
        ]);

        // Get auth tokens - create tokens without affecting global state
        $this->token1 = auth('api')->tokenById($this->user1->id);
        $this->token2 = auth('api')->tokenById($this->user2->id);
    }

    /** @test */
    public function user_can_mark_messages_as_read()
    {
        // User2 sends messages to User1
        $msg1 = Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Hello Alice!',
            'is_deleted' => false,
        ]);

        $msg2 = Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'How are you?',
            'is_deleted' => false,
        ]);

        // User1 marks messages as read
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->postJson('/api/messages/mark-read', [
            'message_ids' => [$msg1->id, $msg2->id],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Messages marked as read',
                'marked_count' => 2,
            ]);

        // Verify reads were recorded
        $this->assertDatabaseHas('message_reads', [
            'message_id' => $msg1->id,
            'user_id' => $this->user1->id,
        ]);

        $this->assertDatabaseHas('message_reads', [
            'message_id' => $msg2->id,
            'user_id' => $this->user1->id,
        ]);
    }

    /** @test */
    public function marking_already_read_messages_is_idempotent()
    {
        $msg = Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Test message',
        ]);

        // Mark as read first time
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->postJson('/api/messages/mark-read', [
            'message_ids' => [$msg->id],
        ])->assertStatus(200);

        $firstCount = MessageRead::where('message_id', $msg->id)->count();

        // Mark as read again
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->postJson('/api/messages/mark-read', [
            'message_ids' => [$msg->id],
        ])->assertStatus(200);

        $secondCount = MessageRead::where('message_id', $msg->id)->count();

        // Should still be only one record
        $this->assertEquals(1, $firstCount);
        $this->assertEquals(1, $secondCount);
    }

    /** @test */
    public function user_cannot_mark_messages_they_did_not_receive()
    {
        // User1 sends to User2
        $msg = Message::create([
            'sender_id' => $this->user1->id,
            'receiver_id' => $this->user2->id,
            'content' => 'Hello Bob!',
        ]);

        // User1 tries to mark their own sent message as read
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->postJson('/api/messages/mark-read', [
            'message_ids' => [$msg->id],
        ]);

        $response->assertStatus(400)
            ->assertJson(['error' => 'No valid messages to mark as read']);

        // Verify no read record was created
        $this->assertDatabaseMissing('message_reads', [
            'message_id' => $msg->id,
            'user_id' => $this->user1->id,
        ]);
    }

    /** @test */
    public function unread_counts_returns_correct_counts_per_sender()
    {
        // User2 sends 3 messages to User1
        Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Message 1',
        ]);

        $msg2 = Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Message 2',
        ]);

        Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Message 3',
        ]);

        // User1 marks one as read
        MessageRead::create([
            'message_id' => $msg2->id,
            'user_id' => $this->user1->id,
        ]);

        // Get unread counts for User1
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->getJson('/api/messages/unread-counts');

        $response->assertStatus(200)
            ->assertJson([
                (string)$this->user2->id => 2, // 3 total - 1 read = 2 unread
            ]);
    }

    /** @test */
    public function unread_counts_returns_empty_when_all_read()
    {
        $msg = Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Only message',
        ]);

        // Mark it as read
        MessageRead::create([
            'message_id' => $msg->id,
            'user_id' => $this->user1->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->getJson('/api/messages/unread-counts');

        $response->assertStatus(200)
            ->assertJson([]);
    }

    /** @test */
    public function unread_counts_ignores_deleted_messages()
    {
        $msg = Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Deleted message',
            'is_deleted' => true,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->getJson('/api/messages/unread-counts');

        $response->assertStatus(200)
            ->assertJson([]);
    }

    /** @test */
    public function unread_counts_ignores_expired_messages()
    {
        Message::create([
            'sender_id' => $this->user2->id,
            'receiver_id' => $this->user1->id,
            'content' => 'Expired message',
            'delete_after' => 60,
            'expires_at' => now()->subHour(), // Expired 1 hour ago
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->getJson('/api/messages/unread-counts');

        $response->assertStatus(200)
            ->assertJson([]);
    }

    /** @test */
    public function mark_read_validates_message_ids_array()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->postJson('/api/messages/mark-read', [
            'message_ids' => 'not-an-array',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message_ids']);
    }

    /** @test */
    public function mark_read_validates_message_ids_exist()
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token1,
        ])->postJson('/api/messages/mark-read', [
            'message_ids' => [99999], // Non-existent ID
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message_ids.0']);
    }
}
