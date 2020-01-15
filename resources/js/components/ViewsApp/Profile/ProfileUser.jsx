import React, {PureComponent} from 'react';
import HeaderHome from "../HeaderHome";
import * as axios from "axios";
import {isString} from "lodash";
import $ from "jquery";

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import {NotifAppMessage} from "../../LayoutApp";
import {Link} from "react-router-dom";
import moment from "moment";

export default class ProfileUser extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            events: [],
            image_user: '',
            friendRequest: null,
            friends: [],

            loading: true,
            loaded: false
        };
        this.handleAddFriend = this.handleAddFriend.bind(this);
        this.handleRemoveFriend = this.handleRemoveFriend.bind(this)
    }

    diffDate(dateData) {
        let dateFirst = new Date(dateData);
        let dateSecond = new Date(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));

        // time difference
        let timeDiff = dateFirst.getTime() - dateSecond.getTime();

        // days and time difference
        let diffDays = timeDiff / (1000 * 3600 * 24);

        return Math.sign(diffDays) !== -1;
    }

    componentDidMount() {
        const username = this.props.match.params.name;

        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            if (isString(username) && username.length > 0) {
                const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                };

                axios.get('/api/profile/' + username + '/' + user.user.auth_token, {
                    headers: headers
                }).then((response) => {
                    if (response.data.success === true) {
                        this.setState({
                            username: response.data.data.username,
                            events: response.data.data.events,
                            image_user: response.data.data.image_user,
                            friendRequest: response.data.data.friendRequest,
                            friends: response.data.data.friends && response.data.data.friends.length !== 0 ?
                                Object.values(response.data.data.friends.data)
                                : [],
                            loading: false
                        });

                        setTimeout(() => this.setState({loaded: true}), 500);
                    } else {
                        NotifAppMessage('danger', response.data.data.message, 'Error found !!!');
                        this.props.history.push('/home');
                    }
                })
            }
        }
    }

    handleAddFriend(event, usernameUser = null) {
        event.preventDefault();

        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const {username} = this.state;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: user
            };

            axios.post(usernameUser ?
                '/api/addFriend/' + usernameUser
                :
                '/api/addFriend/' + username, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    if (!usernameUser) {
                        this.setState({friendRequest: response.data.data.friendRequest});
                    } else {
                        this.setState({
                            friends: this.state.friends.map(d => {
                                if (d.username === usernameUser) {
                                    return {
                                        created: d.created,
                                        id: d.id,
                                        meFriend: {
                                            type_friend: 0
                                        },
                                        setting: d.setting,
                                        userId: d.userId,
                                        username: d.username
                                    }
                                }
                                if (d.meFriend) {
                                    return {
                                        created: d.created,
                                        id: d.id,
                                        meFriend: d.meFriend,
                                        setting: d.setting,
                                        userId: d.userId,
                                        username: d.username
                                    }
                                }
                                return {
                                    created: d.created,
                                    id: d.id,
                                    setting: d.setting,
                                    userId: d.userId,
                                    username: d.username
                                }
                            })
                        })
                    }
                    NotifAppMessage('success', response.data.message, 'Well done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    handleRemoveFriend(event, usernameUser = null) {
        event.preventDefault();

        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const {username} = this.state;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: user
            };

            axios.post(usernameUser ?
                '/api/removeFriend/' + usernameUser
                :
                '/api/removeFriend/' + username, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    if (!usernameUser) {
                        this.setState({friendRequest: response.data.data.friendRequest});
                    } else {
                        this.setState({
                            friends: this.state.friends.map(d => {
                                if (d.username === usernameUser) {
                                    return {
                                        created: d.created,
                                        id: d.id,
                                        setting: d.setting,
                                        userId: d.userId,
                                        username: d.username
                                    }
                                }
                                if (d.meFriend) {
                                    return {
                                        created: d.created,
                                        id: d.id,
                                        meFriend: d.meFriend,
                                        setting: d.setting,
                                        userId: d.userId,
                                        username: d.username
                                    }
                                }
                                return {
                                    created: d.created,
                                    id: d.id,
                                    setting: d.setting,
                                    userId: d.userId,
                                    username: d.username
                                }
                            })
                        })
                    }
                    NotifAppMessage('success', response.data.message, 'Well Done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    render() {
        const {username, events, image_user, friendRequest, friends} = this.state;

        let user = JSON.parse(localStorage.getItem('appState'));

        return (
            <HeaderHome>
                {!this.state.loaded &&
                <div className={`load${this.state.loading ? '' : ' loaded'}`}>
                    <div className="load__icon-wrap">
                        <i className="fa fa-3x fa-cog fa-spin"></i>
                    </div>
                </div>
                }
                <main id='main-container'>
                    <div className="bg-image bg-image-bottom img-background-japan">
                        <div className="bg-primary-dark-op py-30">
                            <div className="content content-full text-center">
                                <div className="mb-15">
                                    <a className="img-link" href="#">
                                        <img className="img-avatar img-avatar96 img-avatar-thumb"
                                             src={image_user !== '' ? image_user : imgAvatar} alt="Logo"/>
                                    </a>
                                </div>
                                <h1 className="h3 text-white font-w700 mb-10">{username}</h1>
                                <h2 className="h5 text-white-op mb-4">
                                    Product Manager <a className="text-primary-light"
                                                       href="#">@GraphicXspace</a>
                                </h2>
                                {
                                    user && user.user.name !== username ?
                                        friendRequest ?
                                            friendRequest.type_friend === 0 ?
                                                <button type="button"
                                                        className="btn btn-rounded btn-hero btn-sm btn-secondary mb-5 mr-2">
                                                    <i className="fa fa-envelope mr-2"></i> Request Enjoyed
                                                </button>
                                                :
                                                <div className='text-center'>
                                                    <button type="button" onClick={this.handleRemoveFriend}
                                                            className="btn btn-rounded btn-hero btn-sm btn-danger mb-5 mr-2">
                                                        <i className="fa fa-trash mr-2"></i> Remove Friend
                                                    </button>

                                                    <Link to={user ? '/planning/' + username : ''}
                                                          class='btn btn-rounded btn-hero btn-sm btn-primary mb-5 mr-2'>
                                                        <i className="fa fa-address-book mr-2"></i> Planning
                                                    </Link>
                                                </div>
                                            :
                                            <button type="button" onClick={this.handleAddFriend}
                                                    className="btn btn-rounded btn-hero btn-sm btn-alt-success mb-5 mr-2">
                                                <i className="fa fa-plus mr-2"></i> Add Friend
                                            </button>
                                        : ''
                                }
                                {
                                    user && user.user.name === username ?
                                        <Link className="btn btn-rounded btn-hero btn-sm btn-secondary mb-5"
                                              to={'/settings/' + username}>
                                            <i className="fa fa-cog mr-2"></i>My Settings
                                        </Link> : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div className="content">
                        <h2 className="content-heading">
                            <Link to={user.user.name === username ? '/my_events' : '/eventsAll/' + username}
                                  className="btn btn-sm btn-rounded btn-alt-secondary float-right">View
                                More..
                            </Link>
                            <i className="fa fa-briefcase mr-2"></i> Events
                        </h2>
                        <div className="row items-push">
                            {
                                events.map(d => {
                                    return (
                                        <div className="col-md-6 col-xl-3">
                                            <div
                                                className={this.diffDate(d.date_event)
                                                    ? 'block block-rounded ribbon ribbon-modern ribbon-primary text-center'
                                                    : 'block block-rounded ribbon ribbon-modern ribbon-danger text-center'
                                                }>
                                                <div className="ribbon-box">
                                                    {
                                                        this.diffDate(d.date_event) ? 'Active' : 'No Active'
                                                    }
                                                </div>
                                                <div className="block-content block-content-full">
                                                    <div
                                                        className="item item-circle bg-danger text-danger-light mx-auto my-20">
                                                        <i className="fa fa-globe"></i>
                                                    </div>
                                                    <div className="text-black">
                                                        {d.title}
                                                    </div>
                                                </div>
                                                <div
                                                    className="block-content block-content-full block-content-sm bg-body-light">
                                                    <div className="font-w600 mb-2">{d.type_event}</div>
                                                    <div className="font-size-sm text-muted">{d.place}</div>
                                                </div>
                                                <div className="block-content block-content-full">
                                                    <Link className="btn btn-rounded btn-secondary"
                                                          to={'/event/show/' + d.slug}>
                                                        <i className="fa fa-briefcase mr-2"></i>View Project
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <h2 className="content-heading">
                            <Link to={user.user.name === username ? '/list_friends' : '/friendsAll/' + username}
                                  className="btn btn-sm btn-rounded btn-alt-secondary float-right">View
                                More..
                            </Link>
                            <i className="fa fa-users mr-2"></i> Friends
                        </h2>
                        <div className="row items-push">
                            {
                                friends.map(d => {
                                    return (
                                        username === user.user.name && d.meFriend && d.meFriend.type_friend === 1 || username !== user.user.name ?
                                            <div className="col-md-6 col-xl-3">
                                                <div className="block block-rounded text-center">
                                                    <div className="block-content block-content-full">
                                                        <img className="img-avatar" src=
                                                            {
                                                                d.setting && d.setting.imageUser
                                                                    ? d.setting.imageUser
                                                                    : imgAvatar
                                                            } alt=""/>
                                                    </div>
                                                    <div
                                                        className="block-content block-content-full block-content-sm bg-body-light">
                                                        <div className="font-w600 mb-2">{d.username}</div>
                                                        <div className="font-size-sm text-muted">
                                                            {
                                                                d.setting && d.setting.activity
                                                                    ? d.setting.activity
                                                                    : 'Not Activity'
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="block-content block-content-full">
                                                        {
                                                            d.userId !== user.user.id ?
                                                                d.meFriend && d.meFriend.type_friend === 0 ?
                                                                    <a className="btn btn-rounded btn-secondary"
                                                                       href="#">
                                                                        <i className="fa fa-envelope mr-2"></i>Send
                                                                    </a>
                                                                    : d.meFriend && d.meFriend.type_friend === 1 ?
                                                                    <button className="btn btn-rounded btn-danger"
                                                                            onClick={e => this.handleRemoveFriend(e, d.username)}>
                                                                        <i className="fa fa-times mr-2"></i>Remove
                                                                    </button>
                                                                    :
                                                                    <button className="btn btn-rounded btn-alt-success"
                                                                            onClick={e => this.handleAddFriend(e, d.username)}>
                                                                        <i className="fa fa-plus mr-2"></i>Add
                                                                    </button>
                                                                : ''
                                                        }
                                                        <a className="btn btn-rounded btn-alt-secondary"
                                                           href={'/profile/' + d.username}>
                                                            <i className="fa fa-user-circle mr-2"></i>Profile
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            : ''
                                    )
                                })
                            }
                            {
                                friends.length === 0 || username === user.user.name &&
                                friends.filter(d => d.meFriend && d.meFriend.type_friend === 1).length === 0 ?
                                    <div className="text-center pl-5">
                                        <em className="text-muted">
                                            Any Friends
                                        </em>
                                    </div>
                                    : ''
                            }
                        </div>
                    </div>
                </main>
            </HeaderHome>
        );
    }
}
