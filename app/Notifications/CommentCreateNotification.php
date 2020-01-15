<?php

namespace App\Notifications;

use App\Event;
use App\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommentCreateNotification extends Notification
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
     * Create a new notification instance.
     * @param User $user
     * @param Event $event
     */
    public function __construct(User $user, Event $event)
    {
        $this->user = $user;
        $this->event = $event;
    }

    /**
     * Get the notification's delivery channels.
     * @param  mixed $notifiable
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
     * @param  mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'data' => $this->user->name . ' has created a commentary on your event ',
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
        return 'CommentCreate';
    }
}
