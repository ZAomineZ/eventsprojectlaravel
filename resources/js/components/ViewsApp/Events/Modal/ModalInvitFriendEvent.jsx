import React, {PureComponent} from 'react'
import * as PropTypes from "prop-types";
import * as axios from "axios";

// Image Avatar default
import imgAvatar from '@img/02th-egg-person.jpg'
import $ from "jquery";
import {NotifAppMessage} from "../../../LayoutApp";

export default class ModalInviteFriendEvent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            friends: [],
            friendsCheck: [],
            event: null
        };
        this.handleChangeFriendsCheck = this.handleChangeFriendsCheck.bind(this);
        this.onSubmit = this.onSubmit.bind(this)
    }

    static propTypes = {
        modalInvite: PropTypes.bool.isRequired,
        onRemoveModal: PropTypes.func.isRequired,
        slug: PropTypes.string.isRequired,
        event: PropTypes.object.isRequired,
        joinUsers: PropTypes.array.isRequired
    };

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps) {
            this.setState({event: nextProps.event})
        }
    }

    handleChangeFriendsCheck(e) {
        let friendID = parseInt(e.target.value);
        if (this.state.friendsCheck.includes(friendID) !== true) {
            this.setState({
                friendsCheck: [...this.state.friendsCheck, friendID]
            })
        }
    }

    onSubmit(e) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                friendsCheck: this.state.friendsCheck,
                authToken: user.user.auth_token,
                slug: this.props.slug
            };

            axios.post('/api/inviteFriend', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    NotifAppMessage('success', response.data.data.message, 'Well done !!!');
                    return this.props.onRemoveModal
                }
            })
        }
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem('appState'));

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
                    this.setState({friends: Object.values(response.data.data.friends.data)})
                }
            })
        }
    }

    render() {
        const {modalInvite, onRemoveModal, joinUsers} = this.props;
        const {friends, event} = this.state;

        return (
            <div className={modalInvite ? 'modal fade show in' : 'modal fade'} id="modal-user"
                 style={{display: modalInvite ? 'block' : 'none'}}>
                <div className="modal-input modal-input-t" role="document">
                    <div className="block-modal">
                        <div className="block block-themed block-transparent mb-0">
                            <div className="block-header">
                                <h3 className="block-title">
                                    <i className="fa fa-users mr-5"></i>
                                    List Users
                                </h3>
                                <div className="block-options">
                                    <button type="button" className="btn-block-option" data-dismiss="modal"
                                            onClick={onRemoveModal}>
                                        <i className="fa fa-close"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="block-content">
                                <form className="my-10" action="" method="post" onSubmit={this.onSubmit}>
                                    <div className="table-responsive">
                                        <table className="table table-center">
                                            <tbody>
                                            {
                                                friends.map((d, key) => {
                                                    return (
                                                        <tr>
                                                            <td className="">
                                                                <img className="img-avatar img-avatar48"
                                                                     src={d.setting && d.setting.imageUser ? d.setting.imageUser : imgAvatar}
                                                                     alt="Logo"/>
                                                            </td>
                                                            <td className="font-w600"
                                                                style={{paddingTop: '24px', paddingRight: '15rem'}}>
                                                                {d.username}
                                                            </td>
                                                            <td className="">
                                                                {
                                                                    joinUsers.length !== 0 && d.username !== joinUsers[key].username && event && event.user_id !== d.userId ||
                                                                        joinUsers.length === 0
                                                                        ? <label
                                                                            className="control-option custom-checkbox mr-auto ml-0 mb-0"
                                                                            style={{
                                                                                paddingLeft: '10px',
                                                                                paddingTop: '35px'
                                                                            }}>
                                                                            <input type="checkbox" className="input-option"
                                                                                   onChange={this.handleChangeFriendsCheck}
                                                                                   name="friendsCheck" value={d.userId}/>
                                                                            <span className="control-indicator"></span>
                                                                        </label>
                                                                        : <p className='text-center mt-3'>Member</p>
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-alt-success" name="friend_invit">
                                            Submit !
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
