<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsUser($user)
    {
        $token = auth('api')->login($user);
        return $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ]);
    }

    protected function createUser($username, $email)
    {
        return User::create([
            'username' => $username,
            'email' => $email,
            'password_hash' => Hash::make('password123'),
        ]);
    }

    /** @test */
    public function user_can_register_with_profile_picture()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('profile.jpg', 200, 200);

        $response = $this->postJson('/api/auth/register', [
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
            'profile_picture' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'username',
                    'email',
                    'profile_picture_url',
                    'last_online',
                    'created_at',
                ],
                'token',
            ]);

        $this->assertNotNull($response->json('user.profile_picture_url'));
        Storage::disk('public')->assertExists('profile_pictures/' . $file->hashName());
    }

    /** @test */
    public function user_can_register_without_profile_picture()
    {
        $response = $this->postJson('/api/auth/register', [
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertNull($response->json('user.profile_picture_url'));
    }

    /** @test */
    public function profile_picture_must_be_valid_image()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->postJson('/api/auth/register', [
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
            'profile_picture' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /** @test */
    public function profile_picture_size_is_limited()
    {
        Storage::fake('public');

        // Create a file larger than 5MB
        $file = UploadedFile::fake()->create('profile.jpg', 6000); // 6MB

        $response = $this->postJson('/api/auth/register', [
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
            'profile_picture' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['profile_picture']);
    }

    /** @test */
    public function authenticated_user_can_update_profile_picture()
    {
        Storage::fake('public');

        $alice = $this->createUser('alice', 'alice@example.com');
        $file = UploadedFile::fake()->image('new_profile.jpg', 200, 200);

        $response = $this->actingAsUser($alice)
            ->postJson('/api/profile/picture', [
                'profile_picture' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'profile_picture_url',
            ]);

        $alice->refresh();
        $this->assertNotNull($alice->profile_picture_url);
        Storage::disk('public')->assertExists('profile_pictures/' . $file->hashName());
    }

    /** @test */
    public function updating_profile_picture_deletes_old_one()
    {
        Storage::fake('public');

        $alice = $this->createUser('alice', 'alice@example.com');
        
        // Upload first profile picture
        $oldFile = UploadedFile::fake()->image('old_profile.jpg', 200, 200);
        $oldPath = $oldFile->store('profile_pictures', 'public');
        $alice->profile_picture_url = Storage::url($oldPath);
        $alice->save();

        // Upload new profile picture
        $newFile = UploadedFile::fake()->image('new_profile.jpg', 200, 200);
        $response = $this->actingAsUser($alice)
            ->postJson('/api/profile/picture', [
                'profile_picture' => $newFile,
            ]);

        $response->assertStatus(200);
        
        // Old file should be deleted
        Storage::disk('public')->assertMissing($oldPath);
        
        // New file should exist
        Storage::disk('public')->assertExists('profile_pictures/' . $newFile->hashName());
    }

    /** @test */
    public function authenticated_user_can_delete_profile_picture()
    {
        Storage::fake('public');

        $alice = $this->createUser('alice', 'alice@example.com');
        
        // Upload profile picture first
        $file = UploadedFile::fake()->image('profile.jpg', 200, 200);
        $path = $file->store('profile_pictures', 'public');
        $alice->profile_picture_url = Storage::url($path);
        $alice->save();

        $response = $this->actingAsUser($alice)
            ->deleteJson('/api/profile/picture');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Profile picture deleted successfully',
            ]);

        $alice->refresh();
        $this->assertNull($alice->profile_picture_url);
        Storage::disk('public')->assertMissing($path);
    }

    /** @test */
    public function cannot_delete_profile_picture_if_none_exists()
    {
        $alice = $this->createUser('alice', 'alice@example.com');

        $response = $this->actingAsUser($alice)
            ->deleteJson('/api/profile/picture');

        $response->assertStatus(404)
            ->assertJson([
                'error' => 'No profile picture to delete',
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_update_profile_picture()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('profile.jpg', 200, 200);

        $response = $this->postJson('/api/profile/picture', [
            'profile_picture' => $file,
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function last_online_is_set_on_registration()
    {
        $response = $this->postJson('/api/auth/register', [
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertNotNull($response->json('user.last_online'));
    }

    /** @test */
    public function last_online_is_updated_on_login()
    {
        $alice = User::create([
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password_hash' => Hash::make('password123'),
            'last_online' => now()->subHours(5),
        ]);

        $oldLastOnline = $alice->last_online;

        $response = $this->postJson('/api/auth/login', [
            'username' => 'alice',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        
        $alice->refresh();
        $this->assertNotEquals($oldLastOnline->timestamp, $alice->last_online->timestamp);
        $this->assertTrue($alice->last_online->greaterThan($oldLastOnline));
    }

    /** @test */
    public function last_online_is_updated_on_token_refresh()
    {
        $alice = User::create([
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password_hash' => Hash::make('password123'),
            'last_online' => now()->subHours(1),
        ]);

        $oldLastOnline = $alice->last_online;

        // Small delay to ensure timestamp difference
        sleep(1);

        $response = $this->actingAsUser($alice)
            ->postJson('/api/auth/refresh');

        $response->assertStatus(200);
        
        $alice->refresh();
        $this->assertTrue($alice->last_online->greaterThan($oldLastOnline));
    }

    /** @test */
    public function last_online_is_included_in_user_responses()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $alice->last_online = now()->subMinutes(15);
        $alice->save();

        $response = $this->actingAsUser($alice)
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'username',
                'email',
                'profile_picture_url',
                'last_online',
                'created_at',
            ]);
    }

    /** @test */
    public function last_online_is_included_in_friend_list()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');
        $bob->last_online = now()->subMinutes(10);
        $bob->save();

        // Create friendship
        \App\Models\Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAsUser($alice)
            ->getJson('/api/friends');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'username',
                    'email',
                    'profile_picture_url',
                    'last_online',
                    'friendship_created_at',
                ],
            ]);
    }

    /** @test */
    public function last_online_is_included_in_user_search()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');
        $bob->last_online = now()->subMinutes(5);
        $bob->save();

        $response = $this->actingAsUser($alice)
            ->getJson('/api/users/bob');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'username',
                'email',
                'profile_picture_url',
                'last_online',
                'created_at',
            ]);
    }

    /** @test */
    public function profile_picture_is_included_in_all_user_responses()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $alice->profile_picture_url = 'https://example.com/profile.jpg';
        $alice->save();

        // Test /me endpoint
        $response = $this->actingAsUser($alice)->getJson('/api/me');
        $response->assertStatus(200);
        $this->assertEquals('https://example.com/profile.jpg', $response->json('profile_picture_url'));

        // Test user search endpoint
        $bob = $this->createUser('bob', 'bob@example.com');
        $response = $this->actingAsUser($bob)->getJson('/api/users/alice');
        $response->assertStatus(200);
        $this->assertEquals('https://example.com/profile.jpg', $response->json('profile_picture_url'));
    }
}
