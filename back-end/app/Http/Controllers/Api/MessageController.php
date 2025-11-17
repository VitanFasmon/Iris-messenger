<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Get chat history with a specific user
     */
    public function index($receiverId)
    {
        $user = auth('api')->user();

        // Check if receiver exists
        $receiver = User::find($receiverId);
        if (!$receiver) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Get all messages between these two users (both directions)
        $messages = Message::where(function ($query) use ($user, $receiverId) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($user, $receiverId) {
            $query->where('sender_id', $receiverId)
                  ->where('receiver_id', $user->id);
        })
        ->where('is_deleted', false)
        ->with('attachments')
        ->orderBy('timestamp', 'asc')
        ->get()
        ->map(function ($message) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'content' => $message->content,
                'file_url' => $message->file_url,
                'timestamp' => $message->timestamp,
                'delete_after' => $message->delete_after,
                'expires_at' => $message->expires_at,
                'attachments' => $message->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'file_type' => $att->file_type,
                        'file_url' => $att->file_url,
                    ];
                }),
            ];
        });

        return response()->json($messages);
    }

    /**
     * Send a message or file
     */
    public function store(Request $request, $receiverId)
    {
        $user = auth('api')->user();

        $validator = Validator::make($request->all(), [
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
            'delete_after' => 'nullable|integer|min:1', // seconds
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if receiver exists
        $receiver = User::find($receiverId);
        if (!$receiver) {
            return response()->json(['error' => 'Receiver not found'], 404);
        }

        // Calculate expiry timestamp if delete_after is provided
        $expiresAt = null;
        if ($request->delete_after) {
            $expiresAt = now()->addSeconds($request->delete_after);
        }

        // Handle file upload
        $fileUrl = null;
        $fileType = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('uploads', 'public');
            $fileUrl = Storage::url($path);

            // Determine file type
            $mimeType = $file->getMimeType();
            if (str_starts_with($mimeType, 'image/')) {
                $fileType = 'image';
            } elseif (str_starts_with($mimeType, 'video/')) {
                $fileType = 'video';
            } elseif (str_starts_with($mimeType, 'audio/')) {
                $fileType = 'audio';
            } else {
                $fileType = 'file';
            }
        }

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiverId,
            'content' => $request->content,
            'file_url' => $fileUrl,
            'delete_after' => $request->delete_after,
            'expires_at' => $expiresAt,
            'is_deleted' => false,
        ]);

        // Create attachment record if file was uploaded
        if ($fileUrl) {
            Attachment::create([
                'message_id' => $message->id,
                'file_type' => $fileType,
                'file_url' => $fileUrl,
            ]);
        }

        $message->load('attachments');

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'content' => $message->content,
                'file_url' => $message->file_url,
                'timestamp' => $message->timestamp,
                'delete_after' => $message->delete_after,
                'expires_at' => $message->expires_at,
                'attachments' => $message->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'file_type' => $att->file_type,
                        'file_url' => $att->file_url,
                    ];
                }),
            ],
        ], 201);
    }

    /**
     * Delete a message manually
     */
    public function destroy($id)
    {
        $user = auth('api')->user();

        $message = Message::find($id);

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        // Only sender can delete their message
        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->update(['is_deleted' => true]);

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
