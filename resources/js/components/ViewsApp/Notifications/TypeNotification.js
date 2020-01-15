export default class NotificationTypeStyle {

    constructor(data) {
        this.type = data.type
    }

    typeNotificationIcon() {
        if (this.type.indexOf('InviteFriend') !== -1) {
            return 'list-timeline-icon fa fa-calendar-check-o bg-primary'
        } else if (this.type.indexOf('AddFriendInvitation') !== -1) {
            return 'list-timeline-icon fa fa-user-plus bg-color-success'
        } else if (this.type.indexOf('RequestJoinEvent') !== -1 ||
            this.type.indexOf('InfoRequestJoinEvent') !== -1) {
            return 'list-timeline-icon fa fa-calendar bg-primary'
        } else if (this.type.indexOf('LeaveEvent') !== -1) {
            return 'list-timeline-icon fa fa-calendar-times-o bg-color-danger'
        } else if (this.type.indexOf('EventUser') !== -1) {
            return 'list-timeline-icon fa fa-user bg-color-success'
        }
        return 'list-timeline-icon fa fa-thumbs-up bg-color-success'
    }

    typeNotificationIconHeader() {
        if (this.type.indexOf('InviteFriend') !== -1) {
            return 'fa fa-fw fa-plus text-primary'
        } else if (this.type.indexOf('AddFriendInvitation') !== -1) {
            return 'fa fa-fw fa-user-plus text-success'
        } else if (this.type.indexOf('RequestJoinEvent') !== -1 ||
            this.type.indexOf('InfoRequestJoinEvent') !== -1) {
            return 'fa fa-fw fa-calendar text-primary'
        } else if (this.type.indexOf('LeaveEvent') !== -1) {
            return 'fa fa-fw fa-calendar-times-o text-danger'
        } else if (this.type.indexOf('EventUser') !== -1) {
            return 'fa fa-fw fa-user text-success'
        }
        return 'fa fa-fw fa-thumbs-up text-success'
    }

    typeNotificationInfo() {
        if (this.type.indexOf('InviteFriend') !== -1) {
            return '+ Invitation event received'
        } else if (this.type.indexOf('ConfirmationInvitationEvent') !== -1) {
            return 'Event Invitation'
        } else if (this.type.indexOf('ConfirmationInvitationFriend') !== -1 ||
            this.type.indexOf('ConfirmationYourInvitation') !== -1) {
            return 'Friend Invitation'
        } else if (this.type.indexOf('AddFriendInvitation') !== -1) {
            return '+ Invitation Friend Received'
        } else if (this.type.indexOf('RequestJoinEvent') !== -1 ||
            this.type.indexOf('InfoRequestJoinEvent') !== -1) {
            return 'Request Join Event'
        } else if (this.type.indexOf('LeaveEvent') !== -1) {
            return 'Event Leave'
        } else if (this.type.indexOf('EventUser') !== -1) {
            return 'Friend Activity'
        }
        return '';
    }

    typeBoolInviteNotification() {
        return this.type.indexOf('InviteFriend') !== -1;
    }

    typeBoolRequestFriendNotification() {
        return this.type.indexOf('AddFriendInvitation') !== -1;
    }

    typeBoolInfoRequestJoinEvent() {
        return this.type.indexOf('InfoRequestJoinEvent') !== -1;
    }

    typeBoolInfoComment()
    {
        return this.type.indexOf('Comment') !== -1;
    }

    typeBoolEventUser()
    {
        return this.type.indexOf('EventUser') !== -1;
    }
}
