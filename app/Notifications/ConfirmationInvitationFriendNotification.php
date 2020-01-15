<?php

namespace App\Notifications;

use App\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConfirmationInvitationFriendNotification extends Notification
{
    use Queueable;
    /**
     * @var User
     */
    private $user;
    /**
     * @var string
     */
    private $type;

    /**
     * Create a new notification instance.
     * @param User $user
     * @param string $type
     */
    public function __construct(User $user, string $type)
    {
        //
        $this->user = $user;
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
            'data' => 'You have ' . $this->type . ' the request Friend to ' . $this->user->name . ' !!!',
            'user_id' => $this->user->id
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
        return 'ConfirmationInvitationFriend';
    }
}
