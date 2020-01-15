import React, {PureComponent} from "react";
import HeaderHome from "../HeaderHome";
import {Animated} from "../Events/EventsAllByUser";
import {isString} from "lodash";
import $ from "jquery";
import * as axios from 'axios';
import ReactPaginate from "react-paginate";

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import {NotifAppMessage} from "../../LayoutApp";

export default class FriendsAllByUser extends PureComponent
{
    constructor(props) {
        super(props);
        this.state = {
            friends: [],
            username: '',
            countPage: 0,
            perPage: 0
        };
        this.handleAddFriend = this.handleAddFriend.bind(this);
        this.handleRemoveFriend = this.handleRemoveFriend.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    handlePageClick(data)
    {
        const selected = data.selected;
        const user = JSON.parse(localStorage.getItem('appState'));
        const  {username} = this.state;

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

            axios.post('/api/pagination/allFriends/' + username, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        friends: Object.values(response.data.data.friends.data)
                    })
                }
            })
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

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        if (user) {
            if (isString(username) && username.length !== 0) {
                const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                };

                axios.get('/api/friendsAll/' + username + '/' + user.user.auth_token, {
                    headers: headers
                }).then(response => {
                    if (response.data.success === true) {
                        this.setState({
                            friends: Object.values(response.data.data.friends.data),
                            username: response.data.data.username,
                            perPage: response.data.data.friends.perPage,
                            countPage: response.data.data.friends.countPage
                        })
                    }
                })
            }
        }
    }

    render() {
        const {username, friends, countPage} = this.state;
        const user = JSON.parse(localStorage.getItem('appState'));

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content content-full">
                        <h2 className='content-heading'>The list Friends to "{username}"</h2>
                            <div className="row gutters-tiny py-20">
                                {
                                    friends.map(d => {
                                        return (
                                            <div className="col-md-6 col-xl-4">
                                                <div className="block text-center">
                                                    <div className="block-content">
                                                        <img className="img-avatar img-avatar-96"
                                                             src=
                                                                 {
                                                                     d.setting ?
                                                                         d.setting.imageUser
                                                                             ? d.setting.imageUser
                                                                             : imgAvatar
                                                                         : imgAvatar
                                                                 } alt=""/>
                                                    </div>
                                                    <div className="block-content block-content-full">
                                                        <div className="font-size-h4 font-w600 mb-0 user_id">
                                                            {d.username}
                                                        </div>
                                                        <div className="font-size-h5">
                                                            {
                                                                d.setting ?
                                                                    d.setting.activity
                                                                        ? d.setting.activity
                                                                        : 'Not Activity'
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
                                        )
                                    })
                                }
                                {
                                    friends.length === 0 &&
                                    <div className="text-center">
                                        <h3 className="font-w600">Any Friends</h3>
                                    </div>
                                }
                            </div>
                            <div className="row py-20">
                                <ReactPaginate
                                    previousLabel={'Previous'}
                                    nextLabel={'Next'}
                                    breakLabel={'...'}
                                    breakClassName={'break-me'}
                                    pageCount={countPage}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={this.handlePageClick}
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
        );
    }
}
