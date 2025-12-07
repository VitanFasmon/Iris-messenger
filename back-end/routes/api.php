<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes (no authentication required)
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes (require JWT authentication)
Route::middleware('auth:api')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('password', [PasswordController::class, 'changePassword']);
    });

    // User routes
    Route::get('me', [AuthController::class, 'me']);
    Route::get('users/{username}', [UserController::class, 'search']);
    Route::get('users/id/{id}', [UserController::class, 'show']);

    // Profile routes
    Route::post('profile/picture', [ProfileController::class, 'updateProfilePicture']);
    Route::delete('profile/picture', [ProfileController::class, 'deleteProfilePicture']);
    Route::patch('profile', [ProfileController::class, 'updateProfile']);

    // Friend routes
    Route::get('friends', [FriendController::class, 'index']);
    Route::get('friends/pending', [FriendController::class, 'pending']);
    Route::get('friends/outgoing', [FriendController::class, 'outgoing']);
    Route::post('friends/{id}', [FriendController::class, 'store']);
    Route::post('friends/{id}/accept', [FriendController::class, 'accept']);
    Route::delete('friends/{id}', [FriendController::class, 'destroy']);

    // Message routes
    Route::get('messages/last', [MessageController::class, 'lastMessages']);
    Route::get('messages/unread-counts', [MessageController::class, 'unreadCounts']);
    Route::post('messages/mark-read', [MessageController::class, 'markAsRead'])->middleware('throttle:60,1');
    Route::get('messages/{receiver_id}', [MessageController::class, 'index']);
    Route::post('messages/{receiver_id}', [MessageController::class, 'store'])->middleware('throttle:30,1');
    Route::delete('messages/{id}', [MessageController::class, 'destroy']);
    Route::get('messages/download/{id}', [MessageController::class, 'download']);
});
