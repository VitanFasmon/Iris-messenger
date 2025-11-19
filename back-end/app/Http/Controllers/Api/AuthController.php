<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:users',
            'email' => 'nullable|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'profile_picture' => 'nullable|image|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profilePictureUrl = null;
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $path = $file->store('profile_pictures', 'public');
            $profilePictureUrl = Storage::url($path);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'profile_picture_url' => $profilePictureUrl,
            'last_online' => now(),
        ]);

        $token = auth('api')->login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'profile_picture_url' => $user->profile_picture_url,
                'last_online' => $user->last_online,
                'created_at' => $user->created_at,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and return JWT token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find user by username
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Update last online time
        $user->updateLastOnline();

        $token = auth('api')->login($user);

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'profile_picture_url' => $user->profile_picture_url,
                'last_online' => $user->last_online,
                'created_at' => $user->created_at,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout user (invalidate token)
     */
    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh JWT token
     */
    public function refresh()
    {
        $user = auth('api')->user();
        
        // Update last online time on token refresh
        $user->updateLastOnline();

        return response()->json([
            'token' => auth('api')->refresh(),
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me()
    {
        $user = auth('api')->user();

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
