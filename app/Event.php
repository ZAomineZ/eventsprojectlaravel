<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class Event extends Model
{
    protected $fillable = ['title', 'slug', 'place', 'content', 'date_event', 'users_max', 'type_event', 'category_id', 'user_id'];

    public $timestamps = true;

    /**
     * @param $user
     * @throws \Exception
     */
    public static function deleteAllEmpty($user)
    {
        $eventsAllEmptyUserId = Event::where('title', '')
            ->where('user_id', (int)$user->user->id ?? null)
            ->get();

        foreach ($eventsAllEmptyUserId as $value) {
            Event::delete($value->id);
        }
    }

    /**
     * @param string|int $categoryId
     * @param bool $redirectCategory
     * @param string|null $categorySlug
     * @return \Illuminate\Http\JsonResponse
     */
    public static function categoriesShow(
        $categoryId,
        bool $redirectCategory = false,
        ?string $categorySlug = null
    ): JsonResponse
    {
        $events = Event::where('category_id', $categoryId)
            ->with('images')
            ->paginate(12);
        $categories = Category::select('id', 'name', 'slug')->get();

        $countEvents = Event::where('category_id', $categoryId)->count();
        $dateActive = Event::where('category_id', $categoryId)
            ->where('date_event', '>', date('Y-m-d H:i:s'))
            ->count();

        $responseData = [
            'success' => true,
            'data' => [
                'events' => $events,
                'categories' => $categories,
                'eventsCount' => $countEvents,
                'activeEvents' => $dateActive
            ]
        ];

        if ($redirectCategory) {
            $responseData['data']['category'] = $categorySlug;
        }

        return response()->json($responseData, 201);
    }

    /**
     * @param array|object $eventsFriends
     * @return array
     */
    public static function friendsSetting($eventsFriends)
    {
        $newData = [];

        if (!empty($eventsFriends)) {
            foreach ($eventsFriends as $key => $eventsFriend) {
                // Search if user to Event have a setting !!!
                $setting = Setting::where('user_id', (int)$eventsFriend->user_id)->first();

                // Insert eventsFriend attributes by default in the array new Data $newData
                $newData[$key + 1]['id'] = $eventsFriend->id;
                $newData[$key + 1]['title'] = $eventsFriend->title;
                $newData[$key + 1]['slug'] = $eventsFriend->slug;
                $newData[$key + 1]['user_id'] = $eventsFriend->user_id;

                if ($setting) {
                    $newData[$key + 1]['settings']['imageUser'] = $setting->image_user ?? null;
                } else {
                    $newData[$key + 1]['settings']['imageUser'] = null;
                }
            }
        }

        return $newData;
    }

    /**
     * @param array|object $eventsJoinFriends
     * @param bool $mountPaginate
     * @return array
     */
    public static function friendsEventWithImages($eventsJoinFriends, bool $mountPaginate = true)
    {
        $newData = [];

        if (!empty($eventsJoinFriends)) {
            foreach ($eventsJoinFriends as $key => $eventsJoinFriend) {
                // Search if user to Join Event have images !!!
                $images = Image::where('event_id', $eventsJoinFriend->event ? (int)$eventsJoinFriend->event->id : (int)$eventsJoinFriend->id)->get();

                // Insert eventsFriend attributes by default in the array new Data $newData
                $newData['data'][$key + 1]['id'] = $eventsJoinFriend->event ? $eventsJoinFriend->event->id : $eventsJoinFriend->id;
                $newData['data'][$key + 1]['title'] = $eventsJoinFriend->event ? $eventsJoinFriend->event->title : $eventsJoinFriend->title;
                $newData['data'][$key + 1]['slug'] = $eventsJoinFriend->event ? $eventsJoinFriend->event->slug : $eventsJoinFriend->slug;
                $newData['data'][$key + 1]['date_event'] = $eventsJoinFriend->event ? $eventsJoinFriend->event->date_event : $eventsJoinFriend->date_event;
                $newData['data'][$key + 1]['users_max'] = $eventsJoinFriend->event ? $eventsJoinFriend->event->users_max : $eventsJoinFriend->users_max;
                $newData['data'][$key + 1]['content'] = $eventsJoinFriend->event ? $eventsJoinFriend->event->content : $eventsJoinFriend->content;
                $newData['data'][$key + 1]['username'] = $eventsJoinFriend->user->name;

                // We recuperate the Category to Event Join Friend !!!
                $category = Category::find($eventsJoinFriend->event ? $eventsJoinFriend->event->category_id : $eventsJoinFriend->category_id);
                $newData['data'][$key + 1]['category'] = $category->name;

                if ($images) {
                    $newData['data'][$key + 1]['images'] = $images;
                } else {
                    $newData['data'][$key + 1]['images'] = [];
                }

                // We recuperate if exist the ImageUser to table setting to User !!!
                $setting = Setting::where('user_id', (int)$eventsJoinFriend->user->id)->first();
                $newData['data'][$key + 1]['settings']['imageUser'] = $setting->image_user ?? null;
            }

            if ($mountPaginate) {
                // Pagination Element (perPage and countPage) !!!
                $newData['perPage'] = $eventsJoinFriends->perPage();
                $newData['countPage'] = $eventsJoinFriends->lastPage();
            }
        }

        return $newData;
    }

    /**
     * @param $eventsFriends
     * @param bool $mountPaginate
     * @return array
     */
    public static function eventsFriends($eventsFriends, bool $mountPaginate = true)
    {
        $newData = [];

        if (!empty($eventsFriends)) {
            foreach ($eventsFriends as $key => $eventsFriend) {
                // Insert eventsFriend attributes by default in the array new Data $newData
                $newData['data'][$key + 1]['id'] = $eventsFriend->id;
                $newData['data'][$key + 1]['title'] = $eventsFriend->title;
                $newData['data'][$key + 1]['slug'] = $eventsFriend->slug;
                $newData['data'][$key + 1]['date_event'] = $eventsFriend->date_event;
                $newData['data'][$key + 1]['users_max'] = $eventsFriend->users_max;
                $newData['data'][$key + 1]['category'] = $eventsFriend->category->name;
                $newData['data'][$key + 1]['images'] = $eventsFriend->images ?? [];
                $newData['data'][$key + 1]['content'] = $eventsFriend->content;
                $newData['data'][$key + 1]['username'] = $eventsFriend->user->name;

                // We recuperate if exist the ImageUser to table setting to User !!!
                $setting = Setting::where('user_id', (int)$eventsFriend->user->id)->first();
                $newData['data'][$key + 1]['settings']['imageUser'] = $setting->image_user ?? null;
            }

            if ($mountPaginate) {
                // Pagination Element (perPage and countPage) !!!
                $newData['perPage'] = $eventsFriends->perPage();
                $newData['countPage'] = $eventsFriends->lastPage();
            }
        }

        return $newData;
    }

    /**
     * @param string $value
     * @param string $params
     * @param array|object|null $user
     * @return mixed
     */
    public static function Notuniq(string $value, string $params, $user = null)
    {
        if ($user) {
            $event = self::where($value, $params)
                ->where('user_id', '!=', (int)$user->user->id)
                ->first();
        } else {
            $event = self::where($value, $params)->first();
        }
        return $event;
    }

    /**
     * @param $query
     * @param string $slug
     * @return mixed
     */
    public function scopeFindBySlug($query, string $slug)
    {
        return $query->select('id', 'user_id', 'title', 'slug')
            ->where('slug', $slug)
            ->first();
    }

    /**
     * @param $query
     * @param $attribute
     * @return mixed
     */
    public function scopeSearchEvents($query, $attribute)
    {
        return $query
            ->with('category:id,name')
            ->with('user:id,name')
            ->where('title', 'LIKE', '%' . $attribute . '%');
    }

    /**
     * @param $query
     * @return mixed
     */
    public function scopeEventsAllLatested($query)
    {
        return $query
            ->with('category:id,name')
            ->with('user:id,name')
            ->orderBy('created_at', 'DESC');
    }

    /**
     * @param $query
     * @param int $userID
     * @param bool $active
     * @return mixed
     */
    public function scopeJoinCount($query, int $userID, bool $active = false)
    {
        if ($active) {
            return $query
                ->join('join_events', 'events.id', '=', 'join_events.event_id')
                ->where('join_events.user_id', $userID)
                ->where('join_events.type_event', 1)
                ->where('date_event', '>', date('Y-m-d H:i:s'));
        }
        return $query
            ->join('join_events', 'events.id', '=', 'join_events.event_id')
            ->where('join_events.type_event', 1)
            ->where('join_events.user_id', $userID);
    }

    /**
     * @param $query
     * @param int $userID
     * @param bool $active
     * @return mixed
     */
    public function scopeGetCountFriendsEvent($query, int $userID, bool $active = false)
    {
        if ($active) {
            return $query
                ->join('friends', 'events.user_id', '=', 'friends.to_user_id')
                ->where('friends.from_user_id', (int)$userID)
                ->where('events.date_event', '>', date('Y-m-d H:i:s'));
        }

        return $query
            ->join('friends', 'events.user_id', '=', 'friends.to_user_id')
            ->where('friends.from_user_id', (int)$userID);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function join_events()
    {
        return $this->hasMany(JoinEvent::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function images()
    {
        return $this->hasMany(Image::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function position_places()
    {
        return $this->hasMany(PositionPlace::class);
    }
}
