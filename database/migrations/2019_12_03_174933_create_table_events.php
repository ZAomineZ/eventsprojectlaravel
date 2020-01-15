<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableEvents extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('title')->default(null);
            $table->string('slug')->default(null);
            $table->longText('content')->default(null);
            $table->string('place')->default(null);
            $table->dateTime('date_event')->default(null);
            $table->integer('users_max')->default(0);
            $table->string('type_event')->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
}
