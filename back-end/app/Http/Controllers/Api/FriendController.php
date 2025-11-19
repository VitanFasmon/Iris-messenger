<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    /**
     * Get list of user's friends
     */
    public function index()
    {
        $user = auth('api')->user();

        // Get all accepted friendships (both directions)
        $friends = Friend::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('friend_id', $user->id);
        })
        ->where('status', 'accepted')
        ->with(['user', 'friend'])
        ->get()
        ->map(function ($friendship) use ($user) {
            // Return the other user in the friendship
            $friend = $friendship->user_id === $user->id 
                ? $friendship->friend 
                : $friendship->user;
            
            return [
                'id' => $friend->id,
                'username' => $friend->username,
                'email' => $friend->email,
                'profile_picture_url' => $friend->profile_picture_url,
                'last_online' => $friend->last_online,
                'friendship_created_at' => $friendship->created_at,
            ];
        });

        return response()->json($friends);
    }

    /**
     * Get pending friend requests (received)
     */
    public function pending()
    {
        $user = auth('api')->user();

        $requests = Friend::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->id,
                    'user' => [
                        'id' => $friendship->user->id,
                        'username' => $friendship->user->username,
                        'email' => $friendship->user->email,
                        'profile_picture_url' => $friendship->user->profile_picture_url,
                        'last_online' => $friendship->user->last_online,
                    ],
                    'created_at' => $friendship->created_at,
                ];
            });

        return response()->json($requests);
    }

    /**
     * Send a friend request
     */
    public function store($friendId)
    {
        $user = auth('api')->user();

        if ($user->id == $friendId) {
            return response()->json(['error' => 'Cannot add yourself as a friend'], 400);
        }

        $friend = User::find($friendId);
        if (!$friend) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Check if friendship already exists
        $existing = Friend::where(function ($query) use ($user, $friendId) {
            $query->where('user_id', $user->id)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            return response()->json([
                'error' => 'Friend request already exists',
                'status' => $existing->status,
            ], 400);
        }

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Friend request sent',
            'friendship' => [
                'id' => $friendship->id,
                'status' => $friendship->status,
                'created_at' => $friendship->created_at,
            ],
        ], 201);
    }

    /**
     * Accept a friend request
     */
    public function accept($id)
    {
        $user = auth('api')->user();

        $friendship = Friend::find($id);

        if (!$friendship) {
            return response()->json(['error' => 'Friend request not found'], 404);
        }

        if ($friendship->friend_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($friendship->status === 'accepted') {
            return response()->json(['error' => 'Friend request already accepted'], 400);
        }

        $friendship->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Friend request accepted',
            'friendship' => [
                'id' => $friendship->id,
                'status' => $friendship->status,
            ],
        ]);
    }

    /**
     * Reject or remove a friend
     */
    public function destroy($id)
    {
        $user = auth('api')->user();

        $friendship = Friend::find($id);

        if (!$friendship) {
            return response()->json(['error' => 'Friendship not found'], 404);
        }

        // User can delete if they're either user_id or friend_id
        if ($friendship->user_id !== $user->id && $friendship->friend_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $friendship->delete();

        return response()->json(['message' => 'Friendship removed']);
    }
}
