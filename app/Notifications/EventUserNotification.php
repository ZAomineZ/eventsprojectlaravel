<?php

namespace App\Notifications;

use App\Event;
use App\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventUserNotification extends Notification
{
    use Queueable;
    /**
     * @var User
     */
    private $user;
    /**
     * @var Event
     */
    private $event;
    /**
     * @var string
     */
    private $type;

    /**
     * Create a new notification instance.
     * @param User $user
     * @param Event $event
     * @param string $type
     */
    public function __construct(User $user, Event $event, string $type)
    {
        $this->user = $user;
        $this->event = $event;
        $this->type = $type;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     * @param  mixed $notifiable
     * @return void
     */
    public function toMail($notifiable)
    {
        //
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'data' => 'Your friend ' . $this->user->name . ' has ' . $this->type . ' to event ',
            'user_id' => $this->user->id,
            'event_id' => $this->event->id,
            'event_slug' => $this->event->slug,
            'data_href' => '"' . $this->event->title . '"'
        ];
    }

    /**
     * @param $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * @return string
     */
    public function broadcastType()
    {
        return 'Event';
    }
}
