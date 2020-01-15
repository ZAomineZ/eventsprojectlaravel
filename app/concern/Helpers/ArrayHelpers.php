<?php
/**
 * Created by PhpStorm.
 * User: bissboss
 * Date: 21/12/19
 * Time: 02:41
 */

namespace App\concern\Helpers;


class ArrayHelpers
{
    /**
     * @param array $arrayIndex
     * @param array $arraySearchSimilar
     * @param string $searchKey
     * @param string $key
     * @param string|null $underKey
     * @param string|null $keyUniq
     * @return array
     */
    public function similarArray(
        array $arrayIndex,
        array $arraySearchSimilar,
        string $searchKey,
        string $key,
        ?string $underKey = null,
        ?string $keyUniq = null
    ): array
    {
        $newdata = [];

        if (isset($arrayIndex['data'])) {
            foreach ($arrayIndex['data'] as $k => $value) {
                $newdata['data'][$k + 1] = $value;
                foreach ($arraySearchSimilar['data'] as $vS) {
                    if ($value[$searchKey] === $vS[$searchKey]) {
                        if (!is_null($underKey)) {
                            if (is_null($keyUniq) || $keyUniq !== 'UNIQ') {
                                $newdata['data'][$k + 1][$key]['id'] = $vS['id'];
                            }
                            $newdata['data'][$k + 1][$key][$underKey] = $vS[$underKey];
                        } else {
                            $newdata['data'][$k + 1][$key] = $vS[$underKey];
                        }
                    }
                }
            }

            if (isset($arrayIndex['perPage']) && isset($arrayIndex['countPage'])) {
                $newdata['perPage'] = $arrayIndex['perPage'];
                $newdata['countPage'] = $arrayIndex['countPage'];
            }
        }

        return $newdata;
    }
}
