<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Friend;
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

        // Pagination: optional `before` (ISO datetime) and `limit` (default 30, max 100)
        $limit = (int) request()->query('limit', 30);
        $limit = max(1, min($limit, 100));
        $before = request()->query('before');

        $query = Message::active()
            ->where(function ($query) use ($user, $receiverId) {
                $query->where(function ($q) use ($user, $receiverId) {
                    $q->where('sender_id', $user->id)
                      ->where('receiver_id', $receiverId);
                })->orWhere(function ($q) use ($user, $receiverId) {
                    $q->where('sender_id', $receiverId)
                      ->where('receiver_id', $user->id);
                });
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            });

        if ($before) {
            $beforeTs = strtotime($before);
            if ($beforeTs !== false) {
                $query->where('timestamp', '<', date('Y-m-d H:i:s', $beforeTs));
            }
        }

        $rows = $query->with('attachments')
            ->orderBy('timestamp', 'desc')
            ->orderBy('id', 'desc') // stable ordering when timestamp is NULL or equal
            ->limit($limit)
            ->get();

        $messages = $rows->reverse()->values()->map(function ($message) {
            return [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'content' => $message->content,
                'file_url' => $message->file_url,
                'filename' => $message->filename,
                'timestamp' => $message->timestamp,
                'delete_after' => $message->delete_after,
                'expires_at' => $message->expires_at,
                'attachments' => $message->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'file_type' => $att->file_type,
                        'file_url' => $att->file_url,
                        'filename' => $att->filename,
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

        // Validate with extensions instead of mimes for broader compatibility
        $validator = Validator::make($request->all(), [
            'content' => 'nullable|string',
            'file' => [
                'nullable',
                'file',
                'max:10240', // 10MB max
                // Use extensions instead of mimes to allow any file type by extension
                'extensions:' .
                    // Images
                    'jpg,jpeg,png,gif,webp,bmp,svg,ico,' .
                    // Documents
                    'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,odt,ods,odp,csv,' .
                    // Archives
                    'zip,rar,7z,tar,gz,' .
                    // Media
                    'mp3,mp4,avi,mov,wmv,flv,mkv,wav,ogg,webm,' .
                    // Code & Text
                    'json,xml,html,css,js,ts,jsx,tsx,php,py,java,c,cpp,h,hpp,cs,rb,go,rs,swift,kt,sh,bat,ps1,sql,md,yaml,yml,toml,ini,' .
                    // eBooks & Other
                    'epub,mobi,azw,azw3'
            ],
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

        // Check if users are friends
        $areFriends = Friend::where(function ($query) use ($user, $receiverId) {
            $query->where(function ($q) use ($user, $receiverId) {
                $q->where('user_id', $user->id)
                  ->where('friend_id', $receiverId);
            })->orWhere(function ($q) use ($user, $receiverId) {
                $q->where('user_id', $receiverId)
                  ->where('friend_id', $user->id);
            });
        })->where('status', 'accepted')->exists();

        if (!$areFriends) {
            return response()->json(['error' => 'You can only message friends'], 403);
        }

        // Calculate expiry timestamp if delete_after is provided
        $expiresAt = null;
        if ($request->delete_after) {
            $expiresAt = now()->addSeconds($request->delete_after);
        }

        // Handle file upload
        $fileUrl = null;
        $fileType = null;
        $filename = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = $file->getClientOriginalName();
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
            'filename' => $filename,
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
                'filename' => $filename,
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
                'filename' => $message->filename,
                'timestamp' => $message->timestamp,
                'delete_after' => $message->delete_after,
                'expires_at' => $message->expires_at,
                'attachments' => $message->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'file_type' => $att->file_type,
                        'file_url' => $att->file_url,
                        'filename' => $att->filename,
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

    /**
     * Download a file attachment with original filename
     */
    public function download($id)
    {
        $user = auth('api')->user();
        $message = Message::find($id);

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        // Check if user is sender or receiver
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$message->file_url) {
            return response()->json(['error' => 'No file attached'], 404);
        }

        // Get the file path from storage (remove /storage prefix if present)
        $filePath = str_replace('/storage/', '', $message->file_url);
        $fullPath = storage_path('app/public/' . $filePath);

        if (!file_exists($fullPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Use original filename or fall back to the stored filename
        $downloadName = $message->filename ?? basename($fullPath);

        return response()->download($fullPath, $downloadName);
    }

    /**
     * Get last message for each friend
     * GET /api/messages/last
     * Returns array of {user_id, last_message, timestamp, content_preview} for each friend with messages.
     */
    public function lastMessages()
    {
        $user = auth('api')->user();

        // Optimized: single-query last message per friend using window function
        $uid = $user->id;
        $sql = "
            SELECT id, sender_id, receiver_id, content, file_url, filename, timestamp, delete_after, expires_at, other_id
            FROM (
                SELECT m.*,
                    (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) AS other_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
                        ORDER BY m.timestamp DESC
                    ) as rn
                FROM messages m
                WHERE (m.sender_id = ? OR m.receiver_id = ?)
                  AND m.is_deleted = 0
                  AND (m.expires_at IS NULL OR m.expires_at > NOW())
            ) t
            WHERE rn = 1
        ";

        $rows = \Illuminate\Support\Facades\DB::select($sql, [$uid, $uid, $uid, $uid]);

        $lastMessages = array_map(function ($r) {
            return [
                'user_id' => $r->other_id,
                'message_id' => $r->id,
                'sender_id' => $r->sender_id,
                'content' => $r->content,
                'file_url' => $r->file_url,
                'filename' => $r->filename,
                'timestamp' => $r->timestamp,
                'delete_after' => $r->delete_after,
                'expires_at' => $r->expires_at,
            ];
        }, $rows);

        return response()->json($lastMessages);
    }
}
