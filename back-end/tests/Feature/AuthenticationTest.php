<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_register_with_valid_data()
    {
        $response = $this->postJson('/api/auth/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'username', 'email', 'created_at'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
        ]);
    }

    /** @test */
    public function user_cannot_register_with_duplicate_username()
    {
        User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/register', [
            'username' => 'johndoe',
            'email' => 'different@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    /** @test */
    public function user_cannot_register_with_duplicate_email()
    {
        User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/register', [
            'username' => 'janedoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function username_is_required_for_registration()
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    /** @test */
    public function password_is_required_for_registration()
    {
        $response = $this->postJson('/api/auth/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function password_must_be_at_least_6_characters()
    {
        $response = $this->postJson('/api/auth/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => '12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function user_can_login_with_correct_credentials()
    {
        $user = User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'johndoe',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'username', 'email', 'created_at'],
                'token',
            ]);
    }

    /** @test */
    public function user_cannot_login_with_wrong_password()
    {
        $user = User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'johndoe',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Invalid credentials']);
    }

    /** @test */
    public function user_cannot_login_with_nonexistent_username()
    {
        $response = $this->postJson('/api/auth/login', [
            'username' => 'nonexistent',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Invalid credentials']);
    }

    /** @test */
    public function authenticated_user_can_get_their_profile()
    {
        $user = User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'username' => 'johndoe',
                'email' => 'john@example.com',
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        $user = User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Successfully logged out']);
    }

    /** @test */
    public function authenticated_user_can_refresh_token()
    {
        $user = User::create([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/auth/refresh');

        $response->assertStatus(200)
            ->assertJsonStructure(['token']);
    }
}
