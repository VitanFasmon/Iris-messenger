<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MessageTest extends TestCase
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

    protected function actingAsUser($user)
    {
        $token = auth('api')->login($user);
        return $this->withHeaders(['Authorization' => "Bearer $token"]);
    }

    /** @test */
    public function user_can_send_text_message()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create friendship first
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAsUser($alice)
            ->postJson("/api/messages/{$bob->id}", [
                'content' => 'Hello Bob!',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'sender_id',
                    'receiver_id',
                    'content',
                    'timestamp',
                ],
            ]);

        $this->assertDatabaseHas('messages', [
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Hello Bob!',
            'is_deleted' => false,
        ]);
    }

    /** @test */
    public function user_can_send_message_with_expiry()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create friendship first
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAsUser($alice)
            ->postJson("/api/messages/{$bob->id}", [
                'content' => 'This message will expire',
                'delete_after' => 300, // 5 minutes
            ]);

        $response->assertStatus(201);

        $message = Message::first();
        $this->assertEquals(300, $message->delete_after);
        $this->assertNotNull($message->expires_at);
        $this->assertTrue($message->expires_at->isFuture());
    }

    /** @test */
    public function user_can_send_message_with_file()
    {
        Storage::fake('public');

        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create friendship first
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $file = UploadedFile::fake()->image('photo.jpg');

        $response = $this->actingAsUser($alice)
            ->post("/api/messages/{$bob->id}", [
                'content' => 'Check out this photo!',
                'file' => $file,
            ]);

        $response->assertStatus(201);

        $message = Message::first();
        $this->assertNotNull($message->file_url);
        $this->assertDatabaseHas('attachments', [
            'message_id' => $message->id,
            'file_type' => 'image',
        ]);
    }

    /** @test */
    public function user_can_retrieve_chat_history()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Alice sends message to Bob
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Hello Bob!',
            'is_deleted' => false,
        ]);

        // Bob replies to Alice
        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'Hi Alice!',
            'is_deleted' => false,
        ]);

        // Alice's conversation with Bob should show both messages
        $response = $this->actingAsUser($alice)
            ->getJson("/api/messages/{$bob->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2);

        $messages = $response->json();
        $this->assertEquals('Hello Bob!', $messages[0]['content']);
        $this->assertEquals('Hi Alice!', $messages[1]['content']);
    }

    /** @test */
    public function chat_history_does_not_include_deleted_messages()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Active message',
            'is_deleted' => false,
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Deleted message',
            'is_deleted' => true,
        ]);

        $response = $this->actingAsUser($alice)
            ->getJson("/api/messages/{$bob->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1);

        $messages = $response->json();
        $this->assertEquals('Active message', $messages[0]['content']);
    }

    /** @test */
    public function user_can_delete_their_own_message()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $message = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Test message',
            'is_deleted' => false,
        ]);

        $response = $this->actingAsUser($alice)
            ->deleteJson("/api/messages/{$message->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Message deleted successfully']);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'is_deleted' => true,
        ]);
    }

    /** @test */
    public function user_cannot_delete_someone_elses_message()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $message = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Test message',
            'is_deleted' => false,
        ]);

        $response = $this->actingAsUser($bob)
            ->deleteJson("/api/messages/{$message->id}");

        $response->assertStatus(403)
            ->assertJson(['error' => 'Unauthorized']);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'is_deleted' => false,
        ]);
    }

    /** @test */
    public function user_cannot_send_message_to_nonexistent_user()
    {
        $alice = $this->createUser('alice', 'alice@example.com');

        $response = $this->actingAsUser($alice)
            ->postJson('/api/messages/999', [
                'content' => 'Hello!',
            ]);

        $response->assertStatus(404)
            ->assertJson(['error' => 'Receiver not found']);
    }

    /** @test */
    public function file_upload_size_is_limited()
    {
        Storage::fake('public');

        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create friendship first
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        // Create a file larger than 10MB (10240 KB)
        $file = UploadedFile::fake()->create('large.pdf', 11000);

        $response = $this->actingAsUser($alice)
            ->post("/api/messages/{$bob->id}", [
                'file' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /** @test */
    public function message_can_have_content_or_file_or_both()
    {
        Storage::fake('public');

        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create friendship first
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        // Message with only content
        $response1 = $this->actingAsUser($alice)
            ->postJson("/api/messages/{$bob->id}", [
                'content' => 'Text only',
            ]);
        $response1->assertStatus(201);

        // Message with only file
        $file = UploadedFile::fake()->image('photo.jpg');
        $response2 = $this->actingAsUser($alice)
            ->post("/api/messages/{$bob->id}", [
                'file' => $file,
            ]);
        $response2->assertStatus(201);

        // Message with both
        $file2 = UploadedFile::fake()->image('photo2.jpg');
        $response3 = $this->actingAsUser($alice)
            ->post("/api/messages/{$bob->id}", [
                'content' => 'Check this out!',
                'file' => $file2,
            ]);
        $response3->assertStatus(201);

        $this->assertCount(3, Message::all());
    }

    /** @test */
    public function expired_messages_are_not_shown_in_chat_history()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Message that expired 5 minutes ago
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Expired message',
            'delete_after' => 60,
            'expires_at' => now()->subMinutes(5),
            'is_deleted' => true, // Marked as deleted by scheduler
        ]);

        // Active message
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Active message',
            'is_deleted' => false,
        ]);

        $response = $this->actingAsUser($alice)
            ->getJson("/api/messages/{$bob->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1);

        $messages = $response->json();
        $this->assertEquals('Active message', $messages[0]['content']);
    }

    /** @test */
    public function chat_history_is_ordered_by_timestamp()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $message1 = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'First message',
            'is_deleted' => false,
        ]);
        $message1->timestamp = now()->subHours(2);
        $message1->save();

        $message2 = Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'Second message',
            'is_deleted' => false,
        ]);
        $message2->timestamp = now()->subHour();
        $message2->save();

        $message3 = Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Third message',
            'is_deleted' => false,
        ]);
        $message3->timestamp = now();
        $message3->save();

        $response = $this->actingAsUser($alice)
            ->getJson("/api/messages/{$bob->id}");

        $messages = $response->json();
        $this->assertEquals('First message', $messages[0]['content']);
        $this->assertEquals('Second message', $messages[1]['content']);
        $this->assertEquals('Third message', $messages[2]['content']);
    }

    /** @test */
    public function user_cannot_send_message_to_non_friend()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // No friendship exists
        $response = $this->actingAsUser($alice)
            ->postJson("/api/messages/{$bob->id}", [
                'content' => 'Hello!',
            ]);

        $response->assertStatus(403)
            ->assertJson(['error' => 'You can only message friends']);
    }

    /** @test */
    public function user_can_send_message_to_accepted_friend()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create accepted friendship
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAsUser($alice)
            ->postJson("/api/messages/{$bob->id}", [
                'content' => 'Hello friend!',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('messages', [
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Hello friend!',
        ]);
    }

    /** @test */
    public function user_cannot_send_message_to_pending_friend()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        // Create pending friendship
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($alice)
            ->postJson("/api/messages/{$bob->id}", [
                'content' => 'Hello!',
            ]);

        $response->assertStatus(403)
            ->assertJson(['error' => 'You can only message friends']);
    }
}
