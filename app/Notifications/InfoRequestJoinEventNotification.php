<?php

namespace App\Notifications;

use App\Event;
use App\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InfoRequestJoinEventNotification extends Notification
{
    use Queueable;
    /**
     * @var string
     */
    private $data;
    /**
     * @var User|null
     */
    private $user;
    /**
     * @var Event|null
     */
    private $event;

    /**
     * Create a new notification instance.
     * @param string $data
     * @param User|null $user
     * @param Event|null $event
     */
    public function __construct(string $data, ?User $user = null, ?Event $event = null)
    {
        $this->data = $data;
        $this->user = $user;
        $this->event = $event;
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
        $array = [
            'data' => $this->data
        ];

        if (!is_null($this->user)) {
            $array['user_id'] = $this->user->id;
        }

        if (!is_null($this->event)) {
            $array['event_id'] = $this->event->id;
        }

        return $array;
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
        return 'InfoRequestJoinEvent';
    }
}
