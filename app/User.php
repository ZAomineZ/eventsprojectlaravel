<?php

namespace App;

use function GuzzleHttp\Psr7\str;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'auth_token'
    ];

    /**
     * The attributes that should be hidden for arrays.
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * @return string
     */
    public function receivesBroadcastNotificationsOn()
    {
        return 'App.User.' . $this->id;
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * @param $query
     * @param $attribute
     * @return mixed
     */
    public function scopeSearchUsers($query, $attribute)
    {
        return $query
            ->select('id', 'name', 'email')
            ->with('settings')
            ->where('name', 'LIKE', '%' . $attribute . '%');
    }

    /**
     * @param $query
     * @return mixed
     */
    public function scopeUsersAllLatested($query)
    {
        return $query
            ->select('id', 'name', 'email')
            ->with('settings')
            ->orderBy('created_at', 'DESC');
    }

    /**
     * @param $query
     * @param string $authToken
     * @return mixed
     */
    public function scopeFindByAuthToken($query, string $authToken)
    {
        return $query->select('id', 'name', 'auth_token')->where('auth_token', $authToken);
    }

    /**
     * @param $query
     * @return mixed
     * @throws \Exception
     */
    public function scopeActiveUsers($query)
    {
        $dateTime = new \DateTime(date('Y-m-d H:i:s'));
        $intervale = new \DateInterval('P2M');

        $dateTime->sub($intervale);

        return $query->where('updated_at', '>', $dateTime->format('Y-m-d H:i:s'));
    }

    /**
     * @param array|object $allUsers
     * @param object $userAuth
     * @param bool $mountPagination
     * @return array|object
     */
    public static function friendUser($allUsers, $userAuth, bool $mountPagination = true)
    {
        $dataUsers = [];

        if ($userAuth) {
            foreach ($allUsers as $key => $user) {
                $dataUsers['data'][$key + 1]['email'] = $user->email;
                $dataUsers['data'][$key + 1]['id'] = $user->id;
                $dataUsers['data'][$key + 1]['name'] = $user->name;
                $dataUsers['data'][$key + 1]['settings'] = $user->settings;

                $friend = Friend::findFriend($user->id, $userAuth->id)->first();

                if ($friend) {
                    $dataUsers['data'][$key + 1]['friend']['type_friend'] = $friend->type_friend;
                }
            }

            if ($mountPagination) {
                // Pagination Element (perPage and countPage) !!!
                $dataUsers['perPage'] = $allUsers->perPage();
                $dataUsers['countPage'] = $allUsers->lastPage();
            }

            return $dataUsers;
        }

        return $allUsers;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function events()
    {
        return $this->hasMany(Event::class);
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
    public function like_comments()
    {
        return $this->hasMany(LikeComment::class);
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
    public function settings()
    {
        return $this->hasMany(Setting::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function friends()
    {
        return $this->hasMany(Friend::class, 'to_user_id');
    }
}
