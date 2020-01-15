<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 30/12/19
 * Time: 11:17
 */

namespace App\concern\Helpers;

class PaginationHelper
{
    /**
     * @param int $selectedPage
     * @param int $perPage
     * @param string $model
     * @param array $options
     * @return object|array
     */
    public static function pagination(int $selectedPage, int $perPage, string $model = 'App\Event', array $options = [])
    {
        $offset = ceil($selectedPage * $perPage);

        if (is_array($options)) {
            $joinItem = isset($options['join']) ? $options['join'] : [];
            $joinTwoItem = isset($options['joinTwo']) ? $options['joinTwo'] : [];
            $attributes = isset($options['attributes']) ? $options['attributes'] : [];
            $attributesSyntax = isset($options['attributesSyntax']) ? $options['attributesSyntax'] : [];
            $attributesSyntaxTwo = isset($options['attributesSyntaxTwo']) ? $options['attributesSyntaxTwo'] : [];
            $getItem = isset($options['get']) ? $options['get'] : '*';

            if (!empty($joinTwoItem)) {
                $items = $model::join($joinItem['table'], $joinItem['fromJoin'], '=', $joinItem['toJoin'])
                    ->join($joinTwoItem['table'], $joinTwoItem['fromJoin'], '=', $joinTwoItem['toJoin'])
                    ->where($attributes)
                    ->where(
                        $attributesSyntax ? $attributesSyntax['name'] : [],
                        $attributesSyntax ? $attributesSyntax['sign'] : [],
                        $attributesSyntax ? $attributesSyntax['value'] : []
                    )
                    ->where(
                        $attributesSyntaxTwo ? $attributesSyntaxTwo['name'] : [],
                        $attributesSyntaxTwo ? $attributesSyntaxTwo['sign'] : [],
                        $attributesSyntaxTwo ? $attributesSyntaxTwo['value'] : []
                    )
                    ->with($options['images'] ? 'images' : [])
                    ->with($options['user'] ? 'user:id,name,email' : [])
                    ->with($options['category'] ? 'category:id,name' : [])
                    ->with(isset($options['events']) && $options['events'] ? 'event:id,title,slug,date_event,category_id,users_max,content' : [])
                    ->orderBy(
                        isset($options['orderBy']) ? $options['orderBy'] : 'id',
                        isset($options['orderBy']) ? 'DESC' : 'ASC'
                    )
                    ->skip($offset)
                    ->take($perPage)
                    ->get($getItem);

                return $items;
            }

            return self::itemsRenderByModel($offset, $perPage, $model, $options, $joinItem, $attributes, $getItem);
        }

        throw new \TypeError('The parameter $options must to be a array and return ' . gettype($options) . ' !!!');
    }

    /**
     * @param int $offset
     * @param int $perPage
     * @param string $model
     * @param array $options
     * @param array $joinItem
     * @param array $attributes
     * @param string|array $getItem
     * @return mixed
     */
    private static function itemsRenderByModel(int $offset, int $perPage, string $model, array $options, array $joinItem, array $attributes, $getItem)
    {
        $attributesSyntax = isset($options['attributesSyntax']) ? $options['attributesSyntax'] : [];
        $attributesSyntaxTwo = isset($options['attributesSyntaxTwo']) ? $options['attributesSyntaxTwo'] : [];
        if (!empty($joinItem)) {
            $items = $model::join($joinItem['table'], $joinItem['fromJoin'], '=', $joinItem['toJoin'])
                ->where($attributes)
                ->where(
                    $attributesSyntax ? $attributesSyntax['name'] : [],
                    $attributesSyntax ? $attributesSyntax['sign'] : [],
                    $attributesSyntax ? $attributesSyntax['value'] : []
                )
                ->where(
                    $attributesSyntaxTwo ? $attributesSyntaxTwo['name'] : [],
                    $attributesSyntaxTwo ? $attributesSyntaxTwo['sign'] : [],
                    $attributesSyntaxTwo ? $attributesSyntaxTwo['value'] : []
                )
                ->with($options['images'] ? 'images' : [])
                ->with($options['user'] ? 'user:id,name,email' : [])
                ->with($options['category'] ? 'category:id,name' : [])
                ->with(isset($options['events']) && $options['events'] ? 'event:id,title,slug,date_event,category_id,users_max,content' : [])
                ->orderBy(
                    isset($options['orderBy']) ? $options['orderBy'] : 'id',
                    isset($options['orderBy']) ? 'DESC' : 'ASC'
                )
                ->skip($offset)
                ->take($perPage)
                ->get($getItem);
        } else {
            $items = $model::where($attributes)
                ->where(
                    $attributesSyntax ? $attributesSyntax['name'] : [],
                    $attributesSyntax ? $attributesSyntax['sign'] : [],
                    $attributesSyntax ? $attributesSyntax['value'] : []
                )
                ->where(
                    $attributesSyntaxTwo ? $attributesSyntaxTwo['name'] : [],
                    $attributesSyntaxTwo ? $attributesSyntaxTwo['sign'] : [],
                    $attributesSyntaxTwo ? $attributesSyntaxTwo['value'] : []
                )
                ->with($options['images'] ? 'images' : [])
                ->with($options['user'] ? 'user:id,name,email' : [])
                ->with($options['category'] ? 'category:id,name' : [])
                ->with(isset($options['events']) && $options['events'] ? 'event:id,title,slug,date_event,category_id,users_max,content' : [])
                ->orderBy(
                    isset($options['orderBy']) ? $options['orderBy'] : 'id',
                    isset($options['orderBy']) ? 'DESC' : 'ASC'
                )
                ->skip($offset)
                ->take($perPage)
                ->get($getItem);
        }

        return $items;
    }

}
