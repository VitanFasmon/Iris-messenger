<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Update user's profile picture
     */
    public function updateProfilePicture(Request $request)
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|image|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Delete old profile picture if exists
        if ($user->profile_picture_url) {
            $oldPath = str_replace('/storage/', '', $user->profile_picture_url);
            Storage::disk('public')->delete($oldPath);
        }

        // Upload new profile picture
        $file = $request->file('profile_picture');
        $path = $file->store('profile_pictures', 'public');
        $profilePictureUrl = Storage::url($path);

        $user->profile_picture_url = $profilePictureUrl;
        $user->save();

        return response()->json([
            'message' => 'Profile picture updated successfully',
            'profile_picture_url' => $user->profile_picture_url,
        ]);
    }

    /**
     * Delete user's profile picture
     */
    public function deleteProfilePicture()
    {
        $user = auth('api')->user();

        if (!$user->profile_picture_url) {
            return response()->json(['error' => 'No profile picture to delete'], 404);
        }

        // Delete profile picture file
        $oldPath = str_replace('/storage/', '', $user->profile_picture_url);
        Storage::disk('public')->delete($oldPath);

        $user->profile_picture_url = null;
        $user->save();

        return response()->json([
            'message' => 'Profile picture deleted successfully',
        ]);
    }
}
