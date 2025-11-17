<?php

namespace App\Console\Commands;

use App\Models\Message;
use Illuminate\Console\Command;

class DeleteExpiredMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'messages:delete-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete or mark as deleted all expired messages';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredMessages = Message::expired()->get();

        $count = $expiredMessages->count();

        if ($count === 0) {
            $this->info('No expired messages found.');
            return 0;
        }

        // Mark messages as deleted
        Message::expired()->update(['is_deleted' => true]);

        $this->info("Successfully marked {$count} expired message(s) as deleted.");

        return 0;
    }
}
