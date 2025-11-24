<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PasswordController extends Controller
{
    /**
     * Change user password
     * POST /api/auth/password
     * Validates current password and updates to new password.
     */
    public function changePassword(Request $request)
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|different:current_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json([
                'errors' => ['current_password' => ['Current password is incorrect']]
            ], 422);
        }

        $user->password_hash = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }
}
