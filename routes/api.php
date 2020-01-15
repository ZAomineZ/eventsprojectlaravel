<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('register', 'HomeAuth\UserController@index');

Route::group(['middleware' => 'api-header'], function () {
    Route::post('register', 'HomeAuth\UserController@createNewUser');
    Route::post('login', 'HomeAuth\UserController@login');
    Route::post('password-forget', 'HomeAuth\UserController@forgetPassword');
    Route::post('tokenUserExist/{authToken}', 'HomeAuth\PasswordConfirmController@newPasswordConfirm');
    Route::post('/event/create', 'HomeAuth\EventsController@create');
    Route::post('/my_events/filter', 'HomeAuth\EventsController@indexFilter');
    Route::post('/event/search', 'HomeAuth\EventsController@searchEvent');
    Route::post('event/update/{slug}', 'HomeAuth\EventsController@Update');
    Route::post('/image/delete/{id}', 'HomeAuth\ImagesController@delete');
    Route::post('/event/delete/{slug}', 'HomeAuth\EventsController@delete');
    Route::post('/event/category/{category}', 'HomeAuth\CategoryController@showCategory');
    Route::post('/settings/secure/{username}', 'HomeAuth\SettingsController@submitSecure');
    Route::post('/settings/private/{username}', 'HomeAuth\SettingsController@submitPrivate');
    Route::post('/settings/picture/{username}', 'HomeAuth\SettingsController@submitPicture');
    Route::post('/event/show/comment/{slug}', 'HomeAuth\CommentsController@createComment');
    Route::post('/event/show/replyComment/{slug}', 'HomeAuth\CommentsController@replyComment');
    Route::post('/event/show/like/{slug}', 'HomeAuth\LikesCommentsController@addLike');
    Route::post('/me_comments/update/{commentID}', 'HomeAuth\CommentsController@update');
    Route::post('/event/joinEvent', 'HomeAuth\JoinEventsController@join');
    Route::post('/event/leaveEvent', 'HomeAuth\JoinEventsController@leave');
    Route::post('/addFriend/{username}', 'appController\FriendsController@addFriend');
    Route::post('/removeFriend/{username}', 'appController\FriendsController@removeFriend');
    Route::post('/dropEvent', 'appController\CalendarController@dropEvent');
    Route::post('/eventClick', 'appController\CalendarController@clickEvent');
    Route::post('/inviteFriend', 'appController\InvitationController@invitationJoinEvent');
    Route::post('/check/notifications', 'appController\NotificationsController@checkNotifications');
    Route::post('/invitation/event', 'appController\NotificationsController@invitationEvent');
    Route::post('/invitation/friend', 'appController\NotificationsController@invitationFriend');
    Route::post('/request/eventJoin', 'appController\NotificationsController@requestEventJoin');
    Route::post('/planning/{username}/{authToken}', 'appController\PlanningsController@create');
    Route::post('/planning/delete/{username}/{authToken}', 'appController\PlanningsController@delete');
    Route::post('/planning/drop/{username}/{authToken}', 'appController\PlanningsController@drop');
    Route::post('/event/create/picture/delete', 'HomeAuth\ImagesController@removeFileRequest');

    Route::post('/pagination/MyEvents', 'HomeAuth\EventsController@paginationMyEvents');
    Route::post('/pagination/Events', 'HomeAuth\EventsController@paginationEvents');
    Route::post('/pagination/Users', 'HomeAuth\UserController@paginationUsers');
    Route::post('/pagination/MyComments', 'HomeAuth\CommentsController@paginationMyComments');
    Route::post('/pagination/EventsCategory', 'HomeAuth\EventsController@paginationEventsCategory');
    Route::post('/pagination/myFriends', 'appController\FriendsController@paginationFriends');
    Route::post('/pagination/EventsFriends', 'appController\FriendsController@paginationEventsFriends');
    Route::post('/pagination/EventsJoinFriends', 'appController\FriendsController@paginationEventsJoinFriends');
    Route::post('/pagination/allEvents/{username}', 'appController\EventsWithFriendsController@paginationEventsAllByUsername');
    Route::post('/pagination/allFriends/{username}', 'appController\FriendsController@paginationFriendsAllByUsername');
    Route::post('/pagination/notifications', 'appController\NotificationsController@paginateNotifications');

    Route::get('rememberCookie/{token}', 'HomeAuth\UserController@reconnectCookie');
    Route::get('tokenUserExist/{authToken}', 'HomeAuth\PasswordConfirmController@tokenUserExist');
    Route::get('my_events/{authToken}', 'HomeAuth\EventsController@index');
    Route::get('event/search/index/{authToken}', 'HomeAuth\EventsController@searchEventIndex');
    Route::get('event/show/{userID}/{slug}', 'HomeAuth\EventsController@showEvent');
    Route::get('event/update/{slug}', 'HomeAuth\EventsController@indexUpdate');
    Route::get('event/create/{authToken}', 'HomeAuth\EventsController@indexCreate');
    Route::get('event/category/{category}', 'HomeAuth\EventsController@allEventsByCategory');
    Route::get('profile/{username}/{authToken}', 'HomeAuth\SettingsController@index');
    Route::get('settings/{username}/{auth_token}', 'HomeAuth\SettingsController@accessPageSetting');
    Route::get('myFriends/{authToken}', 'appController\FriendsController@myFriends');
    Route::get('listFriends/{authToken}', 'appController\FriendsController@indexFriends');
    Route::get('myCalendar/{authToken}', 'appController\CalendarController@index');
    Route::get('home/{authToken}', 'HomeController@index');
    Route::get('homePage/{userID}', 'HomeController@home');
    Route::get('me_comments/{authToken}', 'HomeAuth\CommentsController@index');
    Route::get('me_join_events/{userID}', 'HomeAuth\JoinEventsController@joinEvents');
    Route::get('eventsAll/{username}/{authToken}', 'appController\EventsWithFriendsController@index');
    Route::get('friendsAll/{username}/{authToken}', 'appController\FriendsController@allFriendsByUsername');
    Route::get('allNotifications/{authToken}', 'appController\NotificationsController@index');
    Route::get('notifications/{authToken}', 'appController\NotificationsController@indexAll');
    Route::get('eventsActiveFriends/{username}/{authToken}', 'appController\EventsWithFriendsController@eventsFriendsActive');
    Route::get('eventsNoActiveFriends/{username}/{authToken}', 'appController\EventsWithFriendsController@eventsFriendsNoActive');
    Route::get('planning/{username}/{authToken}', 'appController\PlanningsController@index');
    Route::get('map/event/{slug}', 'HomeAuth\PositionPlacesController@map');
});

Route::group(['middleware' => 'api-header-img'], function () {
    Route::post('/event/created/{userId}', 'HomeAuth\EventsController@createWeb');
    Route::post('/event/updated/{slug}/{userId}', 'HomeAuth\EventsController@updatedWeb');
});

