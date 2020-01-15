import React, {PureComponent} from 'react';
import HeaderHome from "../HeaderHome";
import * as axios from 'axios';

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import $ from "jquery";
import {NotifAppMessage} from "../../LayoutApp";
import {Link} from "react-router-dom";
import ReactPaginate from "react-paginate";

export default class ListFriends extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            friends: [],
            countPage: 0,
            perPage: 0
        };
        this.handleRemoveFriend = this.handleRemoveFriend.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this)
    }

    handlePageClick(data) {
        const selected = data.selected;
        const user = JSON.parse(localStorage.getItem('appState'));

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

            axios.post('/api/pagination/myFriends', {
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

    handleRemoveFriend(event) {
        event.preventDefault();

        let user = JSON.parse(localStorage.getItem('appState'));
        let friend = event.target.getAttribute('data-friend');

        if (user && friend && friend.length !== 0) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: user
            };

            axios.post('/api/removeFriend/' + friend, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    // Filter remove friend
                    this.setState({
                        friends: this.state.friends.filter(d => d.username !== friend)
                    });
                    NotifAppMessage('success', response.data.message, 'Well Done !!!')
                }
            })
        }
    }

    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/listFriends/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        friends: Object.values(response.data.data.friends.data),
                        perPage: response.data.data.friends.perPage,
                        countPage: response.data.data.friends.countPage
                    })
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                    this.props.history.push('/home')
                }
            })
        }
    }

    render() {
        const {friends, countPage} = this.state;

        return (
            <HeaderHome>
                <main id='main-container'>
                    <div className="bg-primary">
                        <div className="bg-pattern bg-black-op25 bd-image img-background-infinity">
                            <div className="content content-top text-center">
                                <div className="py-50">
                                    <h1 className="font-w700 text-white mb-10">Friends</h1>
                                    <h2 className="h4 font-w400 text-white-op">Votre liste d'amis ci-dessous</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="content-full content">
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
                                                <div className="block-content block-content-full bg-light-b">
                                                    <button data-friend={d.username} onClick={this.handleRemoveFriend}
                                                            className="btn btn-circle btn-secondary">
                                                        <i className="fa fa-trash" data-friend={d.username}></i>
                                                    </button>
                                                    <a href="#"
                                                       className="btn btn-circle btn-secondary">
                                                        <i className="fa fa-calendar-plus-o"></i>
                                                    </a>
                                                    <Link to={'/profile/' + d.username}
                                                          className="btn btn-circle btn-secondary">
                                                        <i className="fa fa-users"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            {
                                friends.length === 0 &&
                                <div className="text-center">
                                    <h3 className="font-w600">Aucun Friends</h3>
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
                        <div className="block">
                            <div className="block-content">
                                <div className="row nice-text">
                                    <div className="col-md-4 py-30">
                                        <h3 className="h4 font-w700 text-uppercase pb-10 border-b border-3px">
                                            Vos Amis
                                        </h3>
                                        <p className="mb-0">
                                            Posuere proin blandit accumsan senectus netus nullam curae, ornare
                                            laoreet adipiscing luctus mauris adipiscing pretium eget fermentum,
                                            tristique lobortis est ut metus lobortis tortor tincidunt himenaeos.
                                        </p>
                                    </div>
                                    <div className="col-md-4 py-30">
                                        <h3 className="h4 font-w700 text-uppercase pb-10 border-b border-3px">
                                            Vos Amis
                                        </h3>
                                        <p className="mb-0">
                                            Posuere proin blandit accumsan senectus netus nullam curae, ornare
                                            laoreet adipiscing luctus mauris adipiscing pretium eget fermentum,
                                            tristique lobortis est ut metus lobortis tortor tincidunt himenaeos.
                                        </p>
                                    </div>
                                    <div className="col-md-4 py-30">
                                        <h3 className="h4 font-w700 text-uppercase pb-10 border-b border-3px">
                                            Vos Amis
                                        </h3>
                                        <p className="mb-0">
                                            Posuere proin blandit accumsan senectus netus nullam curae, ornare
                                            laoreet adipiscing luctus mauris adipiscing pretium eget fermentum,
                                            tristique lobortis est ut metus lobortis tortor tincidunt himenaeos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade in block-eve" id="modal-event">
                        <div className="modal-input modal-input-t" role="document">
                            <div className="block-modal">
                                <div className="block block-themed block-transparent mb-0">
                                    <div className="block-header">
                                        <h3 className="block-title">
                                            <i className="fa fa-users mr-5"></i>
                                            List Events
                                        </h3>
                                        <div className="block-options">
                                            <button type="button" className="btn-block-option btn-close"
                                                    data-toggle="dropdown">
                                                <i className="fa fa-close"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="block-content">
                                        <form className="my-10" action="" method="post">
                                            <div className="table-responsive">
                                                <table className="table table-center">
                                                    <tbody>
                                                    <tr>
                                                        <td className="">
                                                            <img className="img-avatar img-avatar48"
                                                                 src={imgAvatar} alt=""/>
                                                        </td>
                                                        <td className="font-w600" data-user="9">
                                                            Event
                                                        </td>
                                                        <td className="">
                                                            <label
                                                                className="control-option custom-checkbox mr-auto ml-0 mb-0">
                                                                <input type="checkbox" className="input-option event_id"
                                                                       name="events[]" value="#"/>
                                                                <span className="control-indicator"></span>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="modal-footer">
                                                <button className="btn btn-alt-success" name="friend_invit"
                                                        id="btn-friend">
                                                    Envoyer !
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </HeaderHome>
        )
    }
}
