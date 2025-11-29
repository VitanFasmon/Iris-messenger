<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('filename', 255)->nullable()->after('file_url');
        });

        Schema::table('attachments', function (Blueprint $table) {
            $table->string('filename', 255)->nullable()->after('file_url');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('filename');
        });

        Schema::table('attachments', function (Blueprint $table) {
            $table->dropColumn('filename');
        });
    }
};
