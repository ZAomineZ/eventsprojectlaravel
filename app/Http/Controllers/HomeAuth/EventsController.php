<?php

namespace App\Http\Controllers\HomeAuth;

use App\Category;
use App\Comment;
use App\concern\Helpers\PaginationHelper;
use App\Event;
use App\Friend;
use App\Image;
use App\JoinEvent;
use App\Notification;
use App\PositionPlace;
use App\Setting;
use App\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EventsController extends Controller
{

    const EXTENSION_IMG = ['image/png', 'image/jpeg'];

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public function create(Request $request)
    {
        // Define Params Request !!!
        $title = $request->all()['params']['title'] ?? '';
        $positionPlace = $request->all()['params']['positionPlace']['coordinates'] ?? [];
        $viewport = $request->all()['params']['viewport'] ?? [];

        $dateEvent = isset($request->all()['params']['date_event']) ?
            date('Y-m-d H:i:s', strtotime($request->all()['params']['date_event']))
            : date('Y-m-d H:i:s');

        $place = $request->all()['params']['place'] ?? '';
        $usersMax = $request->all()['params']['users_max'] ?? 2;

        $categoryId = $request->all()['params']['category_id'] ?? 1;
        $typeEvent = $request->all()['params']['type_event'] ?? 'public';
        $content = $request->all()['params']['content'] ?? '';

        $user = $request->all()['params']['user'] ?? null;
        $userJson = json_decode($user);

        $validateData = $this->validateData($request);

        if ($validateData->fails()) {
            return response()->json(['error' => 'Yours informations aren\'t valid !!!']);
        }

        $event = Event::where('title', '')->where('user_id', (int)$userJson->user->id ?? null)
            ->latest('id')
            ->first();

        if (Event::Notuniq('title', $title)) {
            return response()->json([
                'success' => false,
                'message' => 'This Title is already existed !!!'
            ]);
        }

        if ($event) {
            $event->update([
                'title' => $title,
                'slug' => Str::slug($title),
                'date_event' => $dateEvent,
                'place' => $place,
                'users_max' => (int)$usersMax,
                'category_id' => (int)$categoryId,
                'type_event' => $typeEvent,
                'content' => $content,
                'user_id' => (int)$userJson->user->id ?? null
            ]);
        } else {
            Event::create([
                'title' => $title,
                'slug' => Str::slug($title),
                'date_event' => $dateEvent,
                'place' => $place,
                'users_max' => (int)$usersMax,
                'category_id' => (int)$categoryId,
                'type_event' => $typeEvent,
                'content' => $content,
                'user_id' => (int)$userJson->user->id ?? null
            ]);
        }

        // Delete all events empty !!!
        Event::deleteAllEmpty($userJson);

        // Send Notification to all Friends !!!
        $event = Event::where('user_id', (int)$userJson->user->id)
            ->orderByDesc('id')
            ->first();
        Notification::sendNotificationEvent((int)$userJson->user->id, $event);

        // Add Position place to Event
        PositionPlace::create([
            'position' => implode(', ', $positionPlace),
            'viewport' => \GuzzleHttp\json_encode($viewport),
            'event_id' => $event->id
        ]);

        // Return Response Json with the event !!!
        return $this->renderResponseCreate($event);
    }

    /**
     * @param string $authToken
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(string $authToken): JsonResponse
    {
        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $events = Event::with('images')
                ->where('title', '!=', '')
                ->where('user_id', (int)$user->id)
                ->paginate(12);

            $categories = Category::all();

            $countEvents = Event::where('title', '!=', '')
                ->where('user_id', (int)$user->id)
                ->count();
            $dateActive = Event::where('title', '!=', '')
                ->where('date_event', '>', date('Y-m-d H:i:s'))
                ->where('user_id', (int)$user->id)
                ->count();

            $friendsParticipated = JoinEvent::join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
                ->where('friends.from_user_id', (int)$user->id)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $events,
                    'countEvents' => $countEvents,
                    'categories' => $categories,
                    'dateActive' => $dateActive,
                    'friendsParticipated' => Friend::countParticipated($friendsParticipated)
                ]
            ], 201);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function indexFilter(Request $request)
    {
        $categoryId = $request->all()['params']['categoryId'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'You must be connected for to this accessed to this page !!!'
            ]);
        }

        if ((int)$categoryId === 0) {
            $countEvents = Event::where('title', '!=', '')
                ->where('user_id', (int)$user->id)
                ->count();

            $dateActive = Event::where('title', '!=', '')
                ->where('date_event', '>', date('Y-m-d H:i:s'))
                ->where('user_id', (int)$user->id)
                ->count();

            $friendsParticipated = JoinEvent::join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
                ->where('friends.from_user_id', (int)$user->id)
                ->get();

            $events = Event::with('images')
                ->where('user_id', (int)$user->id)
                ->paginate(12);
        } else {
            $countEvents = Event::where('title', '!=', '')
                ->where('user_id', (int)$user->id)
                ->where('category_id', (int)$categoryId)
                ->count();

            $dateActive = Event::where('title', '!=', '')
                ->where('date_event', '>', date('Y-m-d H:i:s'))
                ->where('user_id', (int)$user->id)
                ->where('category_id', (int)$categoryId)
                ->count();

            $friendsParticipated = JoinEvent::join('events', 'join_events.event_id', '=', 'events.id')
                ->join('friends', 'join_events.user_id', '=', 'friends.to_user_id')
                ->where('friends.from_user_id', (int)$user->id)
                ->where('events.category_id', (int)$categoryId)
                ->get();

            $events = Event::where('category_id', (int)$categoryId)
                ->with('images')
                ->where('user_id', (int)$user->id)
                ->paginate(12);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'events' => $events,
                'countEvents' => $countEvents,
                'dataActive' => $dateActive,
                'friendsParticipated' => Friend::countParticipated($friendsParticipated)
            ]
        ], 201);
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchEvent(Request $request)
    {
        $keyword = $request->all()['params']['search'] ?? '';
        $authToken = $request->all()['params']['authToken'] ?? null;

        $userAuth = User::FindByAuthToken($authToken)->first();

        if (!$userAuth) {
            return response()->json([
                'success' => false,
                'message' => 'You must be to connect for do to this action !!!'
            ]);
        }

        if (is_string($keyword)) {
            $eventsAll = Event::searchEvents($keyword)->paginate(10);
            $usersAll = User::searchUsers($keyword)->paginate(10);

            $countEvents = Event::searchEvents($keyword)->count();
            $countUsers = User::searchUsers($keyword)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $eventsAll,
                    'users' => User::friendUser($usersAll, $userAuth),
                    'countEvents' => $countEvents,
                    'countUsers' => $countUsers
                ]
            ], 201);
        }
    }

    /**
     * @param string $authToken
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchEventIndex(string $authToken)
    {
        $userAuth = User::FindByAuthToken($authToken)->first();

        if (!$userAuth) {
            return response()->json([
                'success' => false,
                'message' => 'You must be to connect for access to this page !!!'
            ]);
        }

        $eventsAll = Event::eventsAllLatested()->paginate(10);
        $usersAll = User::usersAllLatested()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'events' => $eventsAll,
                'users' => User::friendUser($usersAll, $userAuth)
            ]
        ], 201);
    }

    /**
     * @param Request $request
     * @param string|int|null $userID
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function showEvent(Request $request, $userID, string $slug)
    {
        if (is_string($slug)) {
            $event = Event::with('category:id,name,slug')
                ->with('images')
                ->where('slug', $slug)->first();

            if ($event) {
                $setting = Setting::select('id', 'activity', 'bio', 'country', 'image_user')
                    ->where('user_id', (int)$event->user_id)
                    ->first();

                $user = User::select('id', 'name')
                    ->where('id', (int)$event->user_id)
                    ->first();

                $comments = Comment::settingsData(Comment::allByEvent($event->id)->get());

                $settingUser = Setting::select('id', 'image_user')->where('user_id', $userID)->first();

                $joinEvent = JoinEvent::FindJoin($userID, $event->id)->first();

                $joinUsers = JoinEvent::usersFind($event->id);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'event' => $event,
                        'setting' => $setting,
                        'user' => $user,
                        'comments' => Comment::withReply($comments),
                        'settingUser' => $settingUser ? $settingUser : null,
                        'joinEvent' => $joinEvent,
                        'joinUsers' => $joinUsers
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'error' => 'This Event don\'t exist !!!'
                    ]
                ], 201);
            }
        }
    }

    /**
     * @param string $slug
     * @return JsonResponse
     */
    public function indexUpdate(string $slug)
    {
        if (is_string($slug)) {
            $event = Event::with('category:id,name')
                ->with('images')
                ->where('slug', $slug)
                ->first();

            if ($event) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'event' => $event,
                        'positionPlace' => PositionPlace::FindByEvent($event->id)->first()
                    ]
                ]);
            }
        }
    }

    /**
     * @param string $authToken
     * @return JsonResponse
     */
    public function indexCreate(string $authToken)
    {
        if (is_string($authToken)) {
            $user = User::FindByAuthToken($authToken)->first();

            if (!$user) {
                return response()->json([
                    'success' => true,
                    'message' => 'You must be to connected for accessed to this page !!!'
                ]);
            }

            $event = Event::where('title', '')
                ->where('user_id', (int)$user->id)
                ->first();

            $categories = Category::all();

            if ($event) {
                $image = new Image();
                $images = Image::where('event_id', $event->id)->get();
                try {
                    $image->allUnlinksImageByEvent($images, $event->id);
                    $event->delete();

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'categories' => $categories
                        ]
                    ], 201);
                } catch (\Exception $exception) {
                    return response()->json([
                        'exception' => true,
                        'data' => [
                            'message' => $exception->getMessage()
                        ]
                    ], 201);
                }
            } else {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'categories' => $categories
                    ]
                ], 201);
            }
        }
    }

    /**
     * @param Request $request
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function Update(Request $request, string $slug): JsonResponse
    {
        $user = $request->all()['params']['user'] ?? null;
        $userJson = json_decode($user);

        $event = Event::where('slug', $slug)
            ->where('user_id', $userJson->user->id)
            ->firstOrFail();

        if (Event::Notuniq('title', $request->all()['params']['title'], $userJson)) {
            return response()->json([
                'success' => false,
                'message' => 'This Title is already existed !!!'
            ]);
        }

        if ($event) {
            $event->update([
                'title' => $request->all()['params']['title'],
                'slug' => Str::slug($request->all()['params']['title']),
                'date_event' => date('Y-m-d H:i:s', strtotime($request->all()['params']['date_event'])),
                'place' => $request->all()['params']['place'],
                'users_max' => (int)$request->all()['params']['users_max'],
                'category_id' => (int)$request->all()['params']['category_id'],
                'type_event' => $request->all()['params']['type_event'],
                'content' => $request->all()['params']['content']
            ]);

            // Update Position place to Event
            $positionPlace = $request->all()['params']['positionPlace']['coordinates'] ?? [];
            $viewport = $request->all()['params']['viewport'] ?? [];

            PositionPlace::FindByEvent($event->id)->update([
                'position' => implode(', ', $positionPlace),
                'viewport' => \GuzzleHttp\json_encode($viewport)
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'Your event has been updated with success !!!'
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @param string $slug
     * @return JsonResponse
     */
    public function delete(Request $request, string $slug)
    {
        if (is_string($slug) && !empty($slug)) {
            $user = $request->all()['params']['user'];
            $userJson = json_decode($user);

            $event = Event::where('slug', $slug)
                ->where('user_id', $userJson->user->id)
                ->firstOrFail();

            if ($event) {
                $image = new Image();
                $images = Image::where('event_id', $event->id)->get();
                try {
                    $image->allUnlinksImageByEvent($images, $event->id);
                    $event->delete();
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'message' => 'Your Event has been deleted with success !!!'
                        ]
                    ], 201);
                } catch (\Exception $exception) {
                    return response()->json([
                        'exception' => true,
                        'data' => [
                            'message' => $exception->getMessage()
                        ]
                    ], 201);
                }
            }
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationMyEvents(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;
        $category = $request->all()['params']['category'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'attributes' => [
                    'user_id' => $user->id,
                ],
                'images' => true,
                'user' => false,
                'category' => false
            ];

            if (!is_null($category) && $category !== 0) {
                $options['attributes']['category_id'] = $category;
            }

            $eventsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Event', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $eventsPaginate
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationEvents(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();

        if ($user) {
            $options = [
                'orderBy' => 'created_at',
                'images' => false,
                'user' => true,
                'category' => true
            ];

            $eventsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Event', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $eventsPaginate
                ]
            ]);
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function paginationEventsCategory(Request $request): JsonResponse
    {
        $selectedPage = $request->all()['params']['selectedPage'] ?? 0;
        $perPage = $request->all()['params']['perPage'] ?? 0;
        $authToken = $request->all()['params']['authToken'] ?? null;
        $category = $request->all()['params']['category'] ?? null;

        $user = User::FindByAuthToken($authToken)->first();
        $category = Category::where('slug', $category)->first();

        if ($user) {
            $options = [
                'attributes' => [
                    'category_id' => $category->id
                ],
                'images' => true,
                'user' => false,
                'category' => false
            ];

            $eventsPaginate = PaginationHelper::pagination($selectedPage, $perPage, 'App\Event', $options);

            return response()->json([
                'success' => true,
                'data' => [
                    'events' => $eventsPaginate
                ]
            ]);
        }
    }

    /**
     * @param string $category
     * @return JsonResponse
     */
    public function allEventsByCategory(string $category)
    {
        if (is_string($category)) {
            $category = Category::select('id')
                ->where('slug', $category)
                ->first();

            if ($category) {
                return Event::categoriesShow($category->id);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'This category don\'t exist !!!'
                ]);
            }
        }
    }

    /**
     * @param Request $request
     * @return mixed
     */
    private function validateData(Request $request)
    {
        return Validator::make($request->all()['params'], [
            'title' => 'required|min:10|max:50',
            'date_event' => 'required',
            'place' => 'required',
            'users_max' => 'required',
            'category_id' => 'required',
            'type_event' => 'required',
            'content' => 'required|min:15|max:1000'
        ]);
    }

    /**
     * @param Request $request
     * @param Event $event
     */
    private function filesExistingUploaded(Request $request, Event $event)
    {
        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $request->file('file');
        if ($this->filesExtensionsValid($file->getMimeType()) === '') {
            $filename = date('Y-m-d') . '_' . $event->id . '_' . $event->user->id . '_';
            $directory = date('Y') . '/' . date('m') . '/';
            $path = public_path('images/event/' . $directory . $filename);
            $image = $file;
            $pathname = $file->getClientOriginalName();

            Image::SaveImg($image, $path, $pathname, public_path('images/event/' . $directory));

            $image = new Image();
            $image->name = $filename . $pathname;
            $image->img_thumb = asset('images/event/' . $directory . $filename . 'img-thumb-' . $pathname);
            $image->img_medium = asset('images/event/' . $directory . $filename . 'img-medium-' . $pathname);;
            $image->img_original = asset('images/event/' . $directory . $filename . $pathname);;
            $image->event_id = $event->id;
            $image->save();
        }
    }

    /**
     * @param Request $request
     * @param int|string $userId
     * @return array
     */
    public function createWeb($userId, Request $request)
    {
        if ($request->file('file')) {

            $eventFound = Event::where('title', '')->where('user_id', (int)$userId ?? null)
                ->latest('id')
                ->first();

            if ($eventFound) {
                $event = $eventFound->update([
                    'title' => '',
                    'slug' => Str::slug(''),
                    'date_event' => date('Y-m-d h:i:s'),
                    'place' => '',
                    'users_max' => 2,
                    'category_id' => 1,
                    'type_event' => 'public',
                    'content' => '',
                    'user_id' => (int)$userId
                ]);
            } else {
                $event = Event::create([
                    'title' => '',
                    'slug' => Str::slug(''),
                    'date_event' => date('Y-m-d h:i:s'),
                    'place' => '',
                    'users_max' => 2,
                    'category_id' => 1,
                    'type_event' => 'public',
                    'content' => '',
                    'user_id' => (int)$userId
                ]);
            }
            $this->filesExistingUploaded($request, $eventFound ?? $event);
        }
        return [];
    }

    /**
     * @param string $slug
     * @param $userID
     * @param Request $request
     */
    public function updatedWeb(string $slug, $userID, Request $request)
    {
        if ($request->has('file')) {
            $event = Event::where('slug', $slug)
                ->where('user_id', $userID)
                ->firstOrFail();
            if ($event) {
                return $this->filesExistingUploaded($request, $event);
            }
        }
    }

    /**
     * @param string $fileType
     * @return string
     */
    private function filesExtensionsValid(string $fileType)
    {
        $responseMessage = '';
        if (!in_array($fileType, self::EXTENSION_IMG)) {
            $responseMessage .= 'A to yours files isn\'t good format (extenstions accepted : jpg, jpeg) !!!';
        }
        return $responseMessage;
    }

    /**
     * @param Event $event
     * @return \Illuminate\Http\JsonResponse
     */
    private function renderResponseCreate(Event $event)
    {
        $response = [
            'success' => true,
            'data' => [
                'message' => 'You are created your event with success !!!',
                'event' => $event
            ]
        ];

        return response()->json($response, 201);
    }
}
