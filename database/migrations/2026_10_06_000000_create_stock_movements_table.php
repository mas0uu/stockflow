<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(0);
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->uuid('request_id')->unique();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recorded_by');
            $table->string('type', 20);
            $table->integer('quantity_change');
            $table->unsignedInteger('quantity_after');
            $table->string('reason', 500);
            $table->timestamps();
            $table->index(['product_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('quantity');
        });
    }
};
