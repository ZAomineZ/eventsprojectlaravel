<?php

namespace App;

use App\concern\Helpers\ParamsFileString;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $fillable = ['name', 'img_medium', 'img_original', 'img_thumb', 'event_id'];

    const IMAGES_TYPE = ['img_medium', 'img_original', 'img_thumb'];

    /**
     * @param $image
     * @param string $path
     * @param string $pathname
     * @param string $mkdir
     * @return bool
     */
    public static function SaveImg($image, string $path, string $pathname, string $mkdir)
    {
        if (!is_dir($mkdir)) {
            mkdir($mkdir, 0777, true);
        }

        \Intervention\Image\Facades\Image::make($image)->save($path . $pathname);

        \Intervention\Image\Facades\Image::make($image)->resize(450, 250, function ($constraint) {
            $constraint->aspectRatio();
        })->save($path . 'img-medium-' . $pathname);

        \Intervention\Image\Facades\Image::make($image)->resize(200, 200, function ($constraint) {
            $constraint->aspectRatio();
        })->save($path . 'img-thumb-' . $pathname);

        return true;
    }

    /**
     * @param Image $image
     */
    public function unlinkImage(Image $image)
    {
        $fileParams = new ParamsFileString();
        foreach (self::IMAGES_TYPE as $type) {
            $imagePath = $fileParams->ConvertFilePublic($image->{$type});
            unlink($imagePath);
        }
    }

    /**
     * @param $images
     * @param int|string $eventID
     * @return bool
     */
    public function allUnlinksImageByEvent($images, $eventID)
    {
        foreach ($images as $image) {
            $this->unlinkImage($image);
        }
        return $this->deleteAllImageByEvent($eventID);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @param $eventID
     * @return bool
     */
    private function deleteAllImageByEvent($eventID)
    {
        $images = Image::where('event_id', $eventID)->get();

        foreach ($images as $image) {
            $image->delete();
        }

        return true;
    }
}
