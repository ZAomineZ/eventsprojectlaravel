import React, {PureComponent} from "react";
import HeaderHome from "../HeaderHome";
import ReactPaginate from "react-paginate";
import $ from "jquery";
import * as axios from 'axios';
import NotificationTypeStyle from "./TypeNotification";
import {NotifAppMessage} from "../../LayoutApp";
import moment from "moment"

export default class NotificationsAll extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            countPage: 0,
            perPage: 0
        };
        this.handleEventInvitation = this.handleEventInvitation.bind(this);
        this.handleFriendInvitation = this.handleFriendInvitation.bind(this);
        this.handleRequestEvent = this.handleRequestEvent.bind(this);
        this.handlePaginate = this.handlePaginate.bind(this)
    }

    handlePaginate(data)
    {
        let selected = data.selected;
        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                selectedPage: selected,
                perPage: this.state.perPage,
                authToken: user.user.auth_token
            };

            axios.post('/api/pagination/notifications', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        notifications: response.data.data.notifications
                    })
                }
            })
        }
    }

    handleRequestEvent(e, data, type, notificationID) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('appState'));
        const userId = JSON.parse(data.data).user_id;
        const eventId = JSON.parse(data.data).event_id;

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                authToken: user.user.auth_token,
                userID: parseInt(userId),
                eventID: parseInt(eventId),
                type: type,
                notificationID: notificationID
            };

            axios.post('/api/request/eventJoin', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    const notifications = response.data.data.notification;
                    this.setState({notifications: notifications.data})
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    handleFriendInvitation(e, data, type, notificationID) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('appState'));
        const userId = JSON.parse(data.data).user_id;

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                authToken: user.user.auth_token,
                userID: parseInt(userId),
                type: type,
                notificationID: notificationID
            };

            axios.post('/api/invitation/friend', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    const notifications = response.data.data.notification;
                    this.setState({notifications: notifications.data})
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    handleEventInvitation(e, data, type, notificationID) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('appState'));
        const eventId = JSON.parse(data.data).event_id;

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                authToken: user.user.auth_token,
                eventId: parseInt(eventId),
                type: type,
                notificationID: notificationID
            };

            axios.post('/api/invitation/event', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    const notifications = response.data.data.notification;
                    this.setState({notifications: notifications.data})
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    componentWillMount() {
        const user = JSON.parse(localStorage.getItem('appState'));
        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/notifications/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    if (response.data.data.notifications.data) {
                        this.setState({
                            notifications: response.data.data.notifications.data,
                            countPage: response.data.data.notifications.countPage,
                            perPage: response.data.data.notifications.perPage
                        })
                    }
                }
            })
        }
    }

    render() {
        const {notifications, countPage} = this.state;

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content">
                        <h2 className="content-heading">My notifications</h2>
                        <div className="block">
                            <div className="block-header block-header-default">
                                <h3 className="block-title">
                                    Vos différentes activités
                                </h3>
                            </div>
                            <div className="block-content block-content-full">
                                <ul className="list list-timeline list-timeline-modern pull-t">
                                    {
                                        notifications.length > 0 ?
                                            notifications.map(data => {
                                                let notificationTypeStyle = new NotificationTypeStyle(data);
                                                return (
                                                    <li>
                                                        <div className="list-timeline-time">
                                                            {moment(data.created_at).fromNow()}
                                                        </div>
                                                        <i className={notificationTypeStyle.typeNotificationIcon()}></i>
                                                        <div className="list-timeline-content">
                                                            <p className="font-w600">
                                                                {notificationTypeStyle.typeNotificationInfo()}
                                                            </p>
                                                            <p>
                                                                {
                                                                    JSON.parse(data.data).data
                                                                }
                                                                {
                                                                    notificationTypeStyle.typeBoolInfoComment() || notificationTypeStyle.typeBoolEventUser() ?
                                                                        <a href={'event/show/' + JSON.parse(data.data).event_slug}>{JSON.parse(data.data).data_href}</a>
                                                                    : ''
                                                                }
                                                            </p>
                                                            {
                                                                notificationTypeStyle.typeBoolInviteNotification() === true
                                                                    ?
                                                                    <p>
                                                                        <button type='button'
                                                                                onClick={e => this.handleEventInvitation(e, data, 'accept', data.id)}
                                                                                className='btn btn-success mr-2'>Accept
                                                                        </button>
                                                                        <button type='button'
                                                                                onClick={e => this.handleEventInvitation(e, data, 'decline', data.id)}
                                                                                className='btn btn-danger'>Decline
                                                                        </button>
                                                                    </p>
                                                                    :
                                                                    notificationTypeStyle.typeBoolRequestFriendNotification() === true
                                                                        ?
                                                                        <p>
                                                                            <button type='button'
                                                                                    onClick={e => this.handleFriendInvitation(e, data, 'accept', data.id)}
                                                                                    className='btn btn-success mr-2'>Accept
                                                                            </button>
                                                                            <button type='button'
                                                                                    onClick={e => this.handleFriendInvitation(e, data, 'decline', data.id)}
                                                                                    className='btn btn-danger'>Decline
                                                                            </button>
                                                                        </p>
                                                                        :
                                                                        notificationTypeStyle.typeBoolInfoRequestJoinEvent() === true
                                                                            ?
                                                                            <p>
                                                                                <button type='button'
                                                                                        onClick={e => this.handleRequestEvent(e, data, 'accept', data.id)}
                                                                                        className='btn btn-success mr-2'>Accept
                                                                                </button>
                                                                                <button type='button'
                                                                                        onClick={e => this.handleRequestEvent(e, data, 'decline', data.id)}
                                                                                        className='btn btn-danger'>Decline
                                                                                </button>
                                                                            </p>
                                                                            : ''
                                                            }
                                                        </div>
                                                    </li>
                                                )
                                            }) : ''
                                    }
                                </ul>
                            </div>
                        </div>
                        <div className="content">
                            <ReactPaginate
                                previousLabel={'Previous'}
                                nextLabel={'Next'}
                                breakLabel={'...'}
                                breakClassName={'break-me'}
                                pageCount={countPage}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={this.handlePaginate}
                                containerClassName={'pagination'}
                                pageClassName={'paginate_button page-item'}
                                subContainerClassName={'pages pagination'}
                                activeClassName={'active'}
                                pageLinkClassName={'page-link'}
                                previousClassName={'paginate_button page-item previous'}
                                previousLinkClassName={'page-link'}
                                nextClassName={'paginate_button page-item next'}
                                nextLinkClassName={'page-link'}
                            />
                        </div>
                    </div>
                </main>
            </HeaderHome>
        )
    }
}
