<?php
namespace App\concern\Traits;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;

trait PictureAvatar
{
    private $extensions = ['image/png', 'image/jpeg'];

    /**
     * @param Request $request
     * @param User $user
     * @return array|string
     */
    public function saveAvatarPicture(Request $request, User $user)
    {
        /** @var UploadedFile $image */
        $image = $request->file('avatar');

        $dir = public_path() . '/images/user';
        $filename = DIRECTORY_SEPARATOR . $user->id . '.' . $image->extension();
        $file = $dir . $filename;
        $type = $image->getMimeType();

        if (!dir($dir)) {
            mkdir($dir, 0777, true);
        }

        if (empty($this->verifExtensionPicture($type))) {
            $this->movePictureAndResize($file, $image);
            return asset('/images/user') . $filename;
        } else {
            return $this->verifExtensionPicture($type);
        }
    }

    /**
     * @param string $type
     * @return array
     */
    private function verifExtensionPicture(string $type): array
    {
        if (!in_array($type, $this->extensions)) {
            return [
                'message' => 'A to yours files isn\'t good format (extenstions accepted : jpg, jpeg) !!!'
            ];
        }
        return [];
    }

    /**
     * @param string $file
     * @param $image
     * @return \Intervention\Image\Image
     */
    private function movePictureAndResize(string $file, $image)
    {

        return Image::make($image)->resize(96, 96, function ($constraint) {
            $constraint->upsize();
        })->save($file);
    }
}
