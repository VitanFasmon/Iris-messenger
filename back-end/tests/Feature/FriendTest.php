<?php

namespace Tests\Feature;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class FriendTest extends TestCase
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
    public function user_can_send_friend_request()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $response = $this->actingAsUser($alice)
            ->postJson("/api/friends/{$bob->id}");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'friendship' => ['id', 'status', 'created_at'],
            ]);

        $this->assertDatabaseHas('friends', [
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function user_cannot_send_friend_request_to_themselves()
    {
        $alice = $this->createUser('alice', 'alice@example.com');

        $response = $this->actingAsUser($alice)
            ->postJson("/api/friends/{$alice->id}");

        $response->assertStatus(400)
            ->assertJson(['error' => 'Cannot add yourself as a friend']);
    }

    /** @test */
    public function user_cannot_send_duplicate_friend_request()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($alice)
            ->postJson("/api/friends/{$bob->id}");

        $response->assertStatus(400)
            ->assertJson(['error' => 'Friend request already exists']);
    }

    /** @test */
    public function user_cannot_send_friend_request_to_nonexistent_user()
    {
        $alice = $this->createUser('alice', 'alice@example.com');

        $response = $this->actingAsUser($alice)
            ->postJson("/api/friends/999");

        $response->assertStatus(404)
            ->assertJson(['error' => 'User not found']);
    }

    /** @test */
    public function user_can_accept_friend_request()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $friendship = Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($bob)
            ->postJson("/api/friends/{$friendship->id}/accept");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Friend request accepted',
                'friendship' => ['status' => 'accepted'],
            ]);

        $this->assertDatabaseHas('friends', [
            'id' => $friendship->id,
            'status' => 'accepted',
        ]);
    }

    /** @test */
    public function user_cannot_accept_someone_elses_friend_request()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');
        $charlie = $this->createUser('charlie', 'charlie@example.com');

        $friendship = Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($charlie)
            ->postJson("/api/friends/{$friendship->id}/accept");

        $response->assertStatus(403)
            ->assertJson(['error' => 'Unauthorized']);
    }

    /** @test */
    public function user_can_view_accepted_friends()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');
        $charlie = $this->createUser('charlie', 'charlie@example.com');

        // Alice and Bob are friends
        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        // Alice sent request to Charlie (pending)
        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $charlie->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($alice)
            ->getJson('/api/friends');

        $response->assertStatus(200)
            ->assertJsonCount(1); // Only Bob should be listed

        $friends = $response->json();
        $this->assertEquals('bob', $friends[0]['username']);
    }

    /** @test */
    public function user_can_view_pending_friend_requests()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');
        $charlie = $this->createUser('charlie', 'charlie@example.com');

        // Bob sent request to Alice
        Friend::create([
            'user_id' => $bob->id,
            'friend_id' => $alice->id,
            'status' => 'pending',
        ]);

        // Charlie sent request to Alice
        Friend::create([
            'user_id' => $charlie->id,
            'friend_id' => $alice->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($alice)
            ->getJson('/api/friends/pending');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    /** @test */
    public function user_can_remove_friend()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $friendship = Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAsUser($alice)
            ->deleteJson("/api/friends/{$friendship->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Friendship removed']);

        $this->assertDatabaseMissing('friends', [
            'id' => $friendship->id,
        ]);
    }

    /** @test */
    public function user_can_reject_friend_request()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $friendship = Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($bob)
            ->deleteJson("/api/friends/{$friendship->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('friends', [
            'id' => $friendship->id,
        ]);
    }

    /** @test */
    public function friendship_works_bidirectionally()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        // Both Alice and Bob should see each other in friends list
        $aliceFriends = $this->actingAsUser($alice)
            ->getJson('/api/friends')
            ->json();

        $bobFriends = $this->actingAsUser($bob)
            ->getJson('/api/friends')
            ->json();

        $this->assertCount(1, $aliceFriends);
        $this->assertCount(1, $bobFriends);
        $this->assertEquals('bob', $aliceFriends[0]['username']);
        $this->assertEquals('alice', $bobFriends[0]['username']);
    }

    /** @test */
    public function user_can_view_outgoing_friend_requests()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');
        $charlie = $this->createUser('charlie', 'charlie@example.com');

        // Alice sent requests to Bob and Charlie
        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'pending',
        ]);

        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $charlie->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAsUser($alice)
            ->getJson('/api/friends/outgoing');

        $response->assertStatus(200)
            ->assertJsonCount(2);

        $outgoing = $response->json();
        $usernames = array_column(array_column($outgoing, 'user'), 'username');
        $this->assertContains('bob', $usernames);
        $this->assertContains('charlie', $usernames);
    }

    /** @test */
    public function friend_removal_actually_deletes_from_database()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $friendship = Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $friendshipId = $friendship->id;

        // Remove friend
        $response = $this->actingAsUser($alice)
            ->deleteJson("/api/friends/{$friendshipId}");

        $response->assertStatus(200)
            ->assertJson(['id' => $friendshipId]);

        // Verify it's actually deleted
        $this->assertDatabaseMissing('friends', ['id' => $friendshipId]);
        $this->assertNull(Friend::find($friendshipId));
    }
}
