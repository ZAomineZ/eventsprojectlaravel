<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableFriends extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('friends', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('from_user_id');
            $table->foreign('from_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unsignedBIgInteger('to_user_id');
            $table->foreign('to_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->bigInteger('type_friend')->default(0);
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
        Schema::dropIfExists('friends');
    }
}
