<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
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
    public function user_can_search_for_another_user_by_username()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $response = $this->actingAsUser($alice)
            ->getJson('/api/users/bob');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $bob->id,
                'username' => 'bob',
                'email' => 'bob@example.com',
            ]);
    }

    /** @test */
    public function search_returns_404_for_nonexistent_username()
    {
        $alice = $this->createUser('alice', 'alice@example.com');

        $response = $this->actingAsUser($alice)
            ->getJson('/api/users/nonexistent');

        $response->assertStatus(404)
            ->assertJson(['error' => 'User not found']);
    }

    /** @test */
    public function user_can_get_profile_by_id()
    {
        $alice = $this->createUser('alice', 'alice@example.com');
        $bob = $this->createUser('bob', 'bob@example.com');

        $response = $this->actingAsUser($alice)
            ->getJson("/api/users/id/{$bob->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $bob->id,
                'username' => 'bob',
                'email' => 'bob@example.com',
            ]);
    }

    /** @test */
    public function get_profile_returns_404_for_nonexistent_id()
    {
        $alice = $this->createUser('alice', 'alice@example.com');

        $response = $this->actingAsUser($alice)
            ->getJson('/api/users/id/999');

        $response->assertStatus(404)
            ->assertJson(['error' => 'User not found']);
    }

    /** @test */
    public function user_search_requires_authentication()
    {
        $bob = $this->createUser('bob', 'bob@example.com');

        $response = $this->getJson('/api/users/bob');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_profile_endpoint_requires_authentication()
    {
        $bob = $this->createUser('bob', 'bob@example.com');

        $response = $this->getJson("/api/users/id/{$bob->id}");

        $response->assertStatus(401);
    }
}
