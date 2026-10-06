# Stockflow

A shared inventory workspace for a single business, built with Laravel, React, TypeScript, and Inertia.

## Included

- Login, registration, email verification, password reset, and account security settings.
- Categories and products with search, filters, pagination, prices, reorder levels, and active/inactive status.
- Stock receipts, issues, and signed quantity adjustments with required reasons.
- Movement history with the recorded user name and resulting balance. History survives account deletion.
- A dashboard with active product/category counts, total units, low-stock products, and recent activity.

All verified accounts share the same catalog and can manage inventory. This first version assumes trusted staff; it does not yet include roles, invitations, separate businesses, sales checkout, suppliers, or multiple warehouses. Registration is currently enabled in `config/fortify.php`.

## Local setup

Prerequisites: PHP and extensions compatible with `composer.json`, Composer, and a Node version compatible with the installed Vite tooling.

```sh
composer setup
composer dev
```

Open http://localhost:8000 and register. Email verification is required. The default `MAIL_MAILER=log` writes verification emails to `storage/logs/laravel.log`; open the verification URL from that log locally. Configure SMTP when sending real email. The default database is SQLite; `composer setup` creates the database through migrations if needed.

For an existing installation after pulling these changes:

```sh
php artisan migrate
npm run build
```

## Sample accounts

Create three verified accounts for local testing:

```sh
php artisan db:seed --class=SampleAccountSeeder
```

| Name | Email | Password |
| --- | --- | --- |
| Alex Santos | alex@stockflow.test | StockflowDemo!2026 |
| Jamie Reyes | jamie@stockflow.test | StockflowDemo!2026 |
| Morgan Cruz | morgan@stockflow.test | StockflowDemo!2026 |

All three have the same inventory permissions. The seeder only runs in local/testing environments and leaves existing accounts unchanged when rerun.

## First inventory workflow

1. Create an active category.
2. Add a product with a unique SKU, prices, and reorder level.
3. Record a **Received** movement for its opening balance.
4. Record **Issued** movements when stock leaves.
5. Use **Adjustment** for corrections: `-2` removes two units; `3` adds three. Enter the change, not the final count.
6. Review product history and the dashboard. Active products at or below their reorder level appear as low stock.

Quantities are whole units. Prices use two decimal places; use one consistent currency throughout the catalog. Existing products begin at zero when the stock migration is applied; enter opening balances as receipts. Inactive products retain their stock and history but cannot receive new movements. Inactive categories cannot be assigned to new products; their existing products stay usable.

Balance updates and movement records are saved in one database transaction. Negative balances and duplicate submissions of the same movement form are rejected or safely ignored. Movements cannot be edited or deleted through the app; correct mistakes with another movement.

## Checks

```sh
npm run check
npm run types:check
composer test
npm run build
```

Feature tests use an isolated in-memory SQLite database and require PHP's `pdo_sqlite` extension, even when the app uses MySQL. If your Laragon PHP has the SQLite DLLs installed but disabled, you can run the tests without editing its configuration:

```sh
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/pest --compact
```
