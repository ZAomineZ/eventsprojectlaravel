<?php
namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Intervention\Image\Image;

class Setting extends Model
{
    use concern\Traits\PictureAvatar;
    protected $fillable = ['country', 'birth_date', 'activity', 'gender', 'bio', 'user_id', 'image_user'];

    /**
     * @param User $user
     * @param string $newUsername
     * @param string $newEmail
     * @return User
     */
    public static function updateUser(User $user, string $newUsername, string $newEmail)
    {
        $user->name = $newUsername;
        $user->email = $newEmail;
        $user->save();
        return $user;
    }

    /**
     * @param null|string $country
     * @param null|string $birthDate
     * @param null|string $activity
     * @param null|string $gender
     * @param null|string $bio
     * @param User $user
     * @return bool|Setting
     */
    public static function makeRequest(
        ?string $country,
        ?string $birthDate,
        ?string $activity,
        ?string $gender,
        ?string $bio,
        User $user
    )
    {
        $setting = self::select('id')
            ->where('user_id', $user->id)
            ->first();

        if ($setting) {
            $setting->country = $country;
            $setting->birth_date = date('Y-m-d', strtotime($birthDate));
            $setting->activity = $activity;
            $setting->gender = $gender;
            $setting->bio = $bio;
            $setting->user_id = $user->id;
            $setting->save();
            return $setting;
        } else {
            self::create([
                'country' => $country,
                'birth_date' => date('Y-m-d', strtotime($birthDate)),
                'activity' => $activity,
                'gender' => $gender,
                'bio' => $bio,
                'user_id' => $user->id
            ]);
            return true;
        }
    }

    /**
     * @param string $authToken
     * @param string $username
     * @return bool
     */
    public function accessPageOrNot(string $authToken, string $username)
    {
        $user = User::select('id', 'name', 'auth_token')
            ->where('name', $username)
            ->first();

        if (!$user || $user->auth_token !== $authToken) {
            return false;
        }
        return true;
    }

    /**
     * @param Request $request
     * @param User $user
     * @return array|string
     */
    public function saveAvatar(Request $request, User $user)
    {
        // Save picture in the directory Images/user
        $avatar = $this->saveAvatarPicture($request, $user);

        // Insert or Update Setting if the setting is existing or not
        // With the column image_user !!!
        $setting = self::select('id', 'image_user')
            ->where('user_id', $user->id)
            ->first();

        if (is_array($avatar)) {
            return $avatar;
        }

        if ($setting) {
            $setting->image_user = $avatar;
            $setting->save();
            return $setting;
        } else {
            self::create([
                'user_id' => $user->id,
                'image_user' => $avatar
            ]);

            $setting = self::select('id', 'image_user')
                ->where('user_id', $user->id)
                ->first();
            return $setting;
        }
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
