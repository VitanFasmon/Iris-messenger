<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Search for a user by username
     * Excludes the authenticated user and existing friends
     */
    public function search($username)
    {
        $currentUser = auth('api')->user();
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Prevent users from finding themselves
        if ($user->id === $currentUser->id) {
            return response()->json(['error' => 'Cannot search for yourself'], 400);
        }

        // Check if already friends (in any status)
        $existingFriendship = \App\Models\Friend::where(function ($query) use ($currentUser, $user) {
            $query->where('user_id', $currentUser->id)
                  ->where('friend_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $currentUser->id);
        })->first();

        if ($existingFriendship) {
            return response()->json([
                'error' => 'Already connected',
                'message' => $existingFriendship->status === 'accepted' 
                    ? 'You are already friends with this user' 
                    : 'A friend request is already pending with this user',
                'status' => $existingFriendship->status,
            ], 400);
        }

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'profile_picture_url' => $user->profile_picture_url,
            'last_online' => $user->last_online,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Get user profile by ID
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'profile_picture_url' => $user->profile_picture_url,
            'last_online' => $user->last_online,
            'created_at' => $user->created_at,
        ]);
    }
}
