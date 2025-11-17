<?php

namespace Database\Seeders;

use App\Models\Friend;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users
        $alice = User::create([
            'username' => 'alice',
            'email' => 'alice@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $bob = User::create([
            'username' => 'bob',
            'email' => 'bob@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        $charlie = User::create([
            'username' => 'charlie',
            'email' => 'charlie@example.com',
            'password_hash' => Hash::make('password123'),
        ]);

        // Create friendships
        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $bob->id,
            'status' => 'accepted',
        ]);

        Friend::create([
            'user_id' => $alice->id,
            'friend_id' => $charlie->id,
            'status' => 'pending',
        ]);

        Friend::create([
            'user_id' => $bob->id,
            'friend_id' => $charlie->id,
            'status' => 'accepted',
        ]);

        // Create sample messages
        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'Hey Bob! How are you?',
            'delete_after' => null,
            'expires_at' => null,
            'is_deleted' => false,
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $alice->id,
            'content' => 'Hi Alice! I\'m doing great, thanks!',
            'delete_after' => null,
            'expires_at' => null,
            'is_deleted' => false,
        ]);

        Message::create([
            'sender_id' => $alice->id,
            'receiver_id' => $bob->id,
            'content' => 'This message will expire in 5 minutes',
            'delete_after' => 300, // 5 minutes
            'expires_at' => now()->addSeconds(300),
            'is_deleted' => false,
        ]);

        Message::create([
            'sender_id' => $bob->id,
            'receiver_id' => $charlie->id,
            'content' => 'Hey Charlie, want to grab lunch?',
            'delete_after' => null,
            'expires_at' => null,
            'is_deleted' => false,
        ]);

        // Create an already expired message for testing
        Message::create([
            'sender_id' => $charlie->id,
            'receiver_id' => $bob->id,
            'content' => 'This message has already expired',
            'delete_after' => 60,
            'expires_at' => now()->subMinutes(5), // Expired 5 minutes ago
            'is_deleted' => false,
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Test users created:');
        $this->command->info('  - alice (alice@example.com) : password123');
        $this->command->info('  - bob (bob@example.com) : password123');
        $this->command->info('  - charlie (charlie@example.com) : password123');
    }
}
