<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class SampleAccountSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Sample accounts can only be created in local or testing environments.');
        }

        $accounts = [
            'alex@stockflow.test' => 'Alex Santos',
            'jamie@stockflow.test' => 'Jamie Reyes',
            'morgan@stockflow.test' => 'Morgan Cruz',
        ];

        foreach ($accounts as $email => $name) {
            $user = User::firstOrNew(['email' => $email]);

            if ($user->exists) {
                $this->command?->info('Kept existing account: '.$email);

                continue;
            }

            $user->fill([
                'name' => $name,
                'password' => 'StockflowDemo!2026',
            ]);
            $user->email_verified_at = now();
            $user->save();

            $this->command?->info('Created verified sample account: '.$email);
        }
    }
}
