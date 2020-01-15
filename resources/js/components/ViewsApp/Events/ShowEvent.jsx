import React, {PureComponent} from 'react';
import HeaderHome from "../HeaderHome";
import {isString} from "lodash";
import $ from "jquery";
import countryList from 'react-select-country-list'
import * as axios from "axios";
import {Animated} from "react-animated-css";
import {Link} from "react-router-dom";
import {NotifAppMessage} from "../../LayoutApp";
import ModalInviteFriendEvent from "./Modal/ModalInvitFriendEvent";

// Carousel Module
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {Carousel} from "react-responsive-carousel";

// Import Image Default
import projectImage from '@img/cb-project-promo1.png'
import imgAvatar from '@img/02th-egg-person.jpg'

export default class ShowEvent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            event: null,
            setting: null,
            userEvent: null,
            settingUser: null,
            joinEvent: null,
            joinUsers: [],

            comment: '',
            comments: [],
            errors: {
                comment: ''
            },

            loading: true,
            loaded: false,

            modalInvite: false
        };
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSubmitComment = this.handleSubmitComment.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClickCancel = this.handleClickCancel.bind(this);
        this.onClickLike = this.onClickLike.bind(this);
        this.handleJoinEvent = this.handleJoinEvent.bind(this);
        this.handleLeaveEvent = this.handleLeaveEvent.bind(this);
        this.handleModalInvite = this.handleModalInvite.bind(this);
        this.onRemoveModalInvite = this.onRemoveModalInvite.bind(this);
    }

    handleModalInvite(e) {
        e.preventDefault();
        $('body').addClass('modal-open');
        this.setState({modalInvite: !this.state.modalInvite})
    }

    onRemoveModalInvite(e) {
        e.preventDefault();
        $('body').removeClass('modal-open');
        this.setState({modalInvite: false})
    }

    handleLeaveEvent(event) {
        event.preventDefault();

        let userAuth = JSON.parse(localStorage.getItem('appState'));

        if (userAuth) {
            const {event, userEvent} = this.state;
            // const slug = this.props.match.params.slug;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: userAuth,
                eventID: event.id,
                userNameEvent: userEvent.name
            };

            axios.post('/api/event/leaveEvent', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    // CODE
                    this.setState({
                        joinEvent: response.data.joinEvent
                    });
                    NotifAppMessage('success', response.data.message, 'Well done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Error found !!!')
                }
            })
        }
    }

    handleJoinEvent(event) {
        event.preventDefault();

        let userAuth = JSON.parse(localStorage.getItem('appState'));

        if (userAuth) {
            const {event, userEvent} = this.state;
            // const slug = this.props.match.params.slug;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: userAuth,
                eventID: event.id,
                userNameEvent: userEvent.name,
                typeEvent: event.type_event
            };

            axios.post('/api/event/joinEvent', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    // CODE
                    this.setState({
                        joinEvent: response.data.joinEvent
                    });
                    NotifAppMessage('success', response.data.message, 'Well done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Error found !!!')
                }
            })
        }
    }

    onClickLike(event) {
        event.preventDefault();

        let User = JSON.parse(localStorage.getItem('appState'));
        let Comment = event.target.getAttribute('id').split('like-comment-')[1];

        if (User !== null || User !== undefined && Comment !== '') {
            const slug = this.props.match.params.slug;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                commentID: Comment,
                userID: User.user.id
            };

            axios.post('/api/event/show/like/' + slug, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        comments: Object.values(response.data.data.comments)
                    });
                    NotifAppMessage('success', response.data.data.message, 'Well Done !!!')
                }
            })
        }
    }

    cancelComment() {
        let bodyComment = document.getElementById('body-comment');
        let form = document.getElementById('media_block');
        form.setAttribute('data-comment', '0');

        let buttonCancel = document.getElementById('button-cancel');
        buttonCancel.classList.add('d-none');

        bodyComment.appendChild(form);
    }

    handleClickCancel(event) {
        event.preventDefault();
        this.cancelComment();
    }

    handleClick(event) {
        event.preventDefault();

        let id = event.target.id;
        let commentId = id.split('reply-')[1];

        if (commentId !== '') {
            let form = document.getElementById('media_block');
            let comment = document.getElementById('comment-' + commentId);

            form.setAttribute('data-comment', commentId);
            form.classList.add('mb-10');

            let buttonCancel = document.getElementById('button-cancel');
            buttonCancel.classList.remove('d-none');

            comment.appendChild(form);
        }
    }

    componentDidMount() {
        const slug = this.props.match.params.slug;

        if (isString(slug)) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            let User = JSON.parse(localStorage.getItem('appState'));

            axios.get('/api/event/show/' + User.user.id + '/' + slug, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        event: response.data.data.event,
                        setting: response.data.data.setting,
                        userEvent: response.data.data.user,
                        comments: Object.values(response.data.data.comments),
                        settingUser: response.data.data.settingUser,
                        joinEvent: response.data.data.joinEvent,
                        joinUsers: response.data.data.joinUsers,
                        loading: false
                    });

                    setTimeout(() => this.setState({loaded: true}), 500);
                } else {
                    this.props.history.push('/home');
                }
            })
        }
    }

    handleDelete(event) {
        event.preventDefault();
        const slug = this.props.match.params.slug;

        if (isString(slug) && slug.length > 0) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: localStorage.getItem('appState')
            };

            axios.post('/api/event/delete/' + slug, {
                headers: headers,
                params: params
            }).then((response) => {
                if (response.data.success === true) {
                    NotifAppMessage('success', response.data.data.message, 'Well done !!!');
                    this.props.history.push('/home');
                } else if (response.data.exception === true) {
                    NotifAppMessage('danger', response.data.data.message, 'Error Found !!!');
                } else {
                    NotifAppMessage('danger', 'This Event isn\'t exist or your don\'t belong to you !!!', 'Error Found !!!');
                }
            })
        }
    }

    handleChange(event) {
        event.preventDefault();
        const {name, value} = event.target;
        let errors = this.state.errors;

        switch (name) {
            case 'comment' :
                errors.comment = value.length === 0 ? 'Comment Field mustn\'t be empty' :
                    value.length < 5 ? 'Comment Field must be 5 characters long' : '';
                break;
            default:
                break
        }

        this.setState({
            [name]: value
        })
    }

    handleSubmitComment(event) {
        event.preventDefault();

        if (this.validForm(this.state.errors)) {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const slug = this.props.match.params.slug;

            let dataComment = document.getElementById('media_block').getAttribute('data-comment');

            if (dataComment === '0') {
                const params = {
                    comment: this.state.comment,
                    auth: JSON.parse(localStorage.getItem('appState'))
                };

                axios.post('/api/event/show/comment/' + slug, {
                    headers: headers,
                    params: params
                }).then(response => {
                    if (response.data.success === true) {
                        this.setState({
                            comments: Object.values(response.data.data.comments)
                        });
                        NotifAppMessage('success', response.data.data.message, 'Well Done !!!')
                    } else {
                        NotifAppMessage('danger', response.data.data.message, 'Error Found !!!')
                    }
                })
            } else {
                const params = {
                    comment: this.state.comment,
                    auth: JSON.parse(localStorage.getItem('appState')),
                    reply_id: dataComment
                };

                axios.post('/api/event/show/replyComment/' + slug, {
                    headers: headers,
                    params: params
                }).then(response => {
                    if (response.data.success === true) {
                        this.cancelComment();
                        this.setState({comments: Object.values(response.data.data.comments)});
                        NotifAppMessage('success', response.data.data.message, 'Well Done !!!')
                    }
                })
            }
        }
    }

    validForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }

    render() {
        const {event, setting, userEvent, errors, replyForm, joinEvent} = this.state;

        const slug = this.props.match.params.slug;

        let moment = require('moment');

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
                    <div className="content">
                        <h2 className='content-heading'>
                            Title Event :
                            <small> {event ? event.title : ''}</small>
                        </h2>
                        <div className="block">
                            <div className="block-content block-content-full border-b clearfix">
                                <div className="float-right">
                                    {
                                        user && event && user.user.id === event.user_id ?
                                            <div>
                                                <Link className="btn btn-secondary mr-2" to={'/event/update/' + slug}>
                                                    Update
                                                </Link>
                                                <button className="btn btn-danger mr-2" onClick={this.handleDelete}>
                                                    Delete
                                                </button>
                                            </div>
                                            :
                                            !joinEvent || joinEvent && joinEvent.type_event === 2 ?
                                                <button className="btn btn-success mr-2" onClick={this.handleJoinEvent}>
                                                    Join Event
                                                </button>
                                                :
                                                joinEvent && joinEvent.type_event === 0 ?
                                                    <button className="btn btn-secondary mr-2">
                                                        Request Enjoyed
                                                    </button>
                                                    :
                                                    <button className="btn btn-danger mr-2"
                                                            onClick={this.handleLeaveEvent}>
                                                        Leave Event
                                                    </button>
                                    }
                                </div>
                                {
                                    event ?
                                        <Link className="btn btn-secondary"
                                              to={'/event/category/' + event.category.slug}>
                                            <i className="fa fa-th-large text-primary mr-2"></i> {event.category.name}
                                        </Link>
                                        : ''
                                }
                            </div>
                            <div className="block-content block-content-full">
                                <div className="row py-20">
                                    <div className="col-sm-6 js-appear-enabled animated fadeIn" data-toggle="appear">
                                        <Carousel showArrows={true}>
                                            {
                                                event ? event.images.length > 0 ? event.images.map((d, key) => {
                                                        return (
                                                            <div>
                                                                <img alt={"Image slide " + key} src={d.img_original}/>
                                                            </div>
                                                        )
                                                    }) :
                                                    <div>
                                                        <img alt={"Image slide Default"} src={projectImage}/>
                                                    </div>
                                                    : ''
                                            }
                                        </Carousel>
                                        <table className="table table-striped table-borderless mt-20">
                                            <tbody>
                                            <tr>
                                                <td className="font-w600">Place</td>
                                                <td>{event ?
                                                    <Link target="_blank" to={'/map/event/' + slug}>{event.place}</Link> : ''}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-w600">Type Event</td>
                                                <td> {event ?
                                                    event.type_event === 'public' ?
                                                        'Public' : 'Private'
                                                    : ''}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-w600">Category</td>
                                                <td>{event ? event.category.name : ''}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-w600">Users Max</td>
                                                <td>
                                                    {event ? event.users_max : ''}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-w600">Date Event</td>
                                                <td>
                                                    {event ? moment(event.date_event).format('LLL') : ''}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-w600">Event create</td>
                                                <td>
                                                    {event ? moment(event.created_at).format('LLL') : ''}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-sm-6 nice-copy">
                                        <h3 className="mb-10">Content Event</h3>
                                        <p>
                                            {event ? event.content : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="block-content-full border-t">
                                <div className="row text-center py-30 react-enabled animated fadeIn">
                                    <div className="col-6 col-md-4 col-xl-3 py-30">
                                        <div className="item item-rounded item-2px mx-auto push ">
                                            <Link to={userEvent ? '/profile/' + userEvent.name : '#'}
                                                  className="img-link">
                                                <img className="img-avatar img-avatar-96"
                                                     src={setting && setting.image_user ? setting.image_user : imgAvatar}
                                                     alt="User Logo"/>
                                            </Link>
                                        </div>
                                        <h5 className="mb-0">{userEvent ? userEvent.name : ''}</h5>
                                    </div>
                                    {
                                        this.state.joinUsers.map(d => {
                                            return (
                                                <div className="col-6 col-md-4 col-xl-3 py-30">
                                                    <div className="item item-rounded item-2px mx-auto push ">
                                                        <Link className="img-link" to={'/profile/' + d.username}>
                                                            <img className="img-avatar img-avatar-96"
                                                                 src={d.image_user ? d.image_user : imgAvatar}
                                                                 alt="User Logo"/>
                                                        </Link>
                                                    </div>
                                                    <h5 className="mb-0">{d.username ? d.username : ''}</h5>
                                                </div>
                                            )
                                        })
                                    }
                                    {
                                        user && event && user.user.id === event.user_id || joinEvent && joinEvent.type_event === 1 ?
                                            <div className="col-6 col-md-4 col-xl-3 py-30">
                                                <div className="item item-rounded item-2px mx-auto push bg-gray-light">
                                                    <a href="#" className="invit-block"
                                                       onClick={this.handleModalInvite}>
                                                        <i className="fa fa-user-plus text-gray"></i>
                                                    </a>
                                                </div>
                                                <h5 className="mb-0">Envoyer une invitation</h5>
                                            </div> : ''
                                    }
                                </div>
                            </div>
                            <div className="bg-image img-background-japan">
                                <div className="block-content block-content-full bg-dark-op text-center">
                                    <div className="py-30 fadeIn animated">
                                        <div class="py-10">
                                            <img className="img-avatar img-avatar-96 img-avatar-thumb"
                                                 src={setting && setting.image_user ? setting.image_user : imgAvatar}
                                                 alt=""/>
                                        </div>
                                        <div className="row justify-center py-10">
                                            <div className="col-md-8">
                                                <h3 className="text-white font-w700 mb-2 text-center">{setting && setting.activity ? setting.activity : 'Any Activity'}</h3>
                                                <p className="text-muted">{setting && setting.country ? countryList().getLabel(setting.country) : 'France'}</p>
                                                <p className="font-size-lg text-body-bg-dark">{setting && setting.bio ? setting.bio : 'Any Bio'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                user && event && user.user.id === event.user_id || joinEvent && joinEvent.type_event === 1 ?
                                    <div className="bg-body-d">
                                        <div className="content content-full">
                                            <div className="row justify-center">
                                                <div className="col-lg-8" id='body-comment'>
                                                    <h3 className="font-w700 mb-50">Commentaires</h3>
                                                    {
                                                        this.state.comments.map(d => {
                                                            return (
                                                                <Animated animationIn="zoomIn" animationOut="fadeOut"
                                                                          isVisible={true}>
                                                                    <div id={'comment-' + d.comment.id}>
                                                                        <div className="media mb-2">
                                                                            <img
                                                                                className="img-avatar d-flex mr-20 img-avatar48"
                                                                                src={d.setting && d.setting.image_user ? d.setting.image_user : imgAvatar}
                                                                                alt=""/>
                                                                            <div className="media-b">
                                                                                <p className="mb-5">
                                                                                    <div id="">
                                                                                        <a href="#"
                                                                                           className="font-w600">{d.comment.user ? d.comment.user.name : ''}</a>
                                                                                        <span
                                                                                            className="text-muted mr-2">. {moment(new Date(d.comment.created_at)).startOf('day').fromNow()}</span>
                                                                                        <br/> {d.comment.content}
                                                                                    </div>
                                                                                    <div className="font-size-sm">
                                                                            <span className="badge badge-primary mr-3">
                                                                               <a href='#'
                                                                                  id={'like-comment-' + d.comment.id}
                                                                                  onClick={this.onClickLike}
                                                                                  className='badge badge-primary'>
                                                                                   <i id={'like-comment-' + d.comment.id}
                                                                                      className="fa fa-thumbs-up mr-1"></i>
                                                                               </a>
                                                                                {d.comment.likes ? d.comment.likes : 0}
                                                                            </span>
                                                                                        <div className="form_block">
                                                                                            <a className="link-effect btn-reply"
                                                                                               onClick={this.handleClick}
                                                                                               id={'reply-' + d.comment.id}
                                                                                               style={{cursor: 'pointer'}}
                                                                                               name="reply">Reply </a>
                                                                                        </div>
                                                                                    </div>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        Object.values(d.comment.reply).map(d => {
                                                                            return (
                                                                                <Animated animationIn="zoomIn"
                                                                                          animationOut="fadeOut"
                                                                                          isVisible={true}
                                                                                          className='pl-50'>
                                                                                    <div id={'comment-' + d.comment.id}>
                                                                                        <div className="media mb-2">
                                                                                            <img
                                                                                                className="img-avatar d-flex mr-20 img-avatar48"
                                                                                                src={d.setting && d.setting.image_user ? d.setting.image_user : imgAvatar}
                                                                                                alt=""/>
                                                                                            <div className="media-b">
                                                                                                <p className="mb-5">
                                                                                                    <div id="">
                                                                                                        <a href="#"
                                                                                                           className="font-w600">{d.comment.user ? d.comment.user.name : ''}</a>
                                                                                                        <span
                                                                                                            className="text-muted mr-2">. {moment(new Date(d.comment.created_at)).startOf('day').fromNow()}</span>
                                                                                                        <br/> {d.comment.content}
                                                                                                    </div>
                                                                                                    <div
                                                                                                        className="font-size-sm">
                                                                                                <span id="#"
                                                                                                      className="badge badge-primary mr-3">
                                                                                                    <a href='#'
                                                                                                       id={'like-comment-' + d.comment.id}
                                                                                                       onClick={this.onClickLike}
                                                                                                       className='badge badge-primary'>
                                                                                                        <i id={'like-comment-' + d.comment.id}
                                                                                                           className="fa fa-thumbs-up mr-1"></i>
                                                                                                    </a>
                                                                                                    {d.comment.likes ? d.comment.likes : 0}
                                                                                                </span>
                                                                                                    </div>
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </Animated>
                                                                            )
                                                                        })
                                                                    }
                                                                </Animated>
                                                            )
                                                        })
                                                    }
                                                    <div id="media_block" data-comment="0">
                                                        <Animated animationIn="swing" animationOut="fadeOut"
                                                                  isVisible={true} className="media">
                                                            <img className="img-avatar img-avatar48 d-flex mr-20"
                                                                 src={this.state.settingUser !== null ? this.state.settingUser.image_user : imgAvatar}
                                                                 alt=""/>
                                                            <div className="media-b">
                                                                <form action="#" method="post"
                                                                      onSubmit={this.handleSubmitComment}>
                                                                        <textarea name="comment" id="comment"
                                                                                  onChange={this.handleChange}
                                                                                  className={errors.comment.length > 0 ? 'form-control is-invalid mb-5' : 'form-control mb-5'}
                                                                                  rows="5">
                                                                            Votre commentaire...
                                                                        </textarea>
                                                                    {
                                                                        errors.comment.length > 0 &&
                                                                        <div
                                                                            className={errors.comment.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                                            {errors.comment}
                                                                        </div>
                                                                    }
                                                                    <div>
                                                                        <button type='submit'
                                                                                className="btn btn-secondary">
                                                                            <i className="fa fa-reply mr-2"></i>
                                                                            Respond
                                                                        </button>
                                                                        <button type='submit'
                                                                                onClick={this.handleClickCancel}
                                                                                id='button-cancel'
                                                                                className="btn btn-warning ml-3 d-none">
                                                                            <i className="fa fa-window-close mr-2"></i>
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </Animated>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : ''
                            }
                        </div>
                    </div>
                    <ModalInviteFriendEvent
                        modalInvite={this.state.modalInvite}
                        joinUsers={this.state.joinUsers}
                        onRemoveModal={this.onRemoveModalInvite}
                        event={event}
                        slug={slug}/>
                    <div className={this.state.modalInvite ? 'modal-backdrop fade show' : ''}></div>
                </main>
            </HeaderHome>
        )
    }
}
