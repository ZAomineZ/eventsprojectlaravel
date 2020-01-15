import React, {PureComponent} from 'react';
import LayoutApp from "../LayoutApp";
import {Redirect} from "react-router";
import {Link} from "react-router-dom";
import $ from "jquery";
import {LogoutUser, NotifAppMessage, NotifGlobal} from "../LayoutApp";
import * as axios from "axios";
import Echo from 'laravel-echo'
import moment from 'moment'

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import {isString} from "lodash";
import NotificationTypeStyle from "./Notifications/TypeNotification";

export default class HeaderHome extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            onConfirm: false,
            onCancel: false,
            redirectLoginPage: false,
            menuBar: true,
            menuAsideBar: false,
            colorBar: false,
            menuOption: false,
            menuUser: false,
            searchBar: false,
            notifications: false,
            searchInput: '',
            redirectSearchEvent: false,

            // State for User :
            settings: null,
            countMeEvents: 0,
            countEventsJoin: 0,
            friends: 0,
            friendsList: [],
            notificationsNoCheck: 0,
            notificationsAll: []
        };
        this.onLogout = this.onLogout.bind(this);
        this.handleMenuBar = this.handleMenuBar.bind(this);
        this.handleMenuAsideBar = this.handleMenuAsideBar.bind(this);
        this.handleMenuOption = this.handleMenuOption.bind(this);
        this.handleBarSearch = this.handleBarSearch.bind(this);
        this.handleChangeInputSearch = this.handleChangeInputSearch.bind(this);
        this.handleNotification = this.handleNotification.bind(this);
        this.onSubmitSearch = this.onSubmitSearch.bind(this);
        this.onHandleUser = this.onHandleUser.bind(this);
        this.onChangeColor = this.onChangeColor.bind(this);
    }

    onSubmitSearch(event) {
        event.preventDefault();
        if (document.location.pathname) {
            if (document.location.pathname === '/event/search') {
                NotifAppMessage('danger', 'You are already on the search page', 'Warning !!!');
            } else {
                this.setState({redirectSearchEvent: !this.state.redirectSearchEvent})
            }
        }
    }

    handleNotification() {
        this.setState({notifications: !this.state.notifications});
        return this.checkAllNotifications();
    }

    handleChangeInputSearch(event) {
        this.setState({searchInput: event.target.value})
    }

    handleBarSearch() {
        this.setState({searchBar: !this.state.searchBar})
    }

    onHandleUser() {
        this.setState({menuUser: !this.state.menuUser});
    }

    onChangeColor() {
        this.setState({colorBar: !this.state.colorBar})
    }

    handleMenuBar() {
        this.setState({menuBar: !this.state.menuBar})
    }

    handleMenuAsideBar() {
        this.setState({menuAsideBar: !this.state.menuAsideBar})
    }

    handleMenuOption() {
        this.setState({menuOption: !this.state.menuOption})
    }

    onConfirm() {
        this.setState({onConfirm: !this.state.onConfirm})
    }

    onCancel() {
        this.setState({onCancel: !this.state.onCancel})
    }

    onLogout() {
        LogoutUser();
        NotifGlobal('Logout !!!', 'You are logout with success !!!', 'success', this.onConfirm(), this.onCancel());
        this.setState({redirectLoginPage: !this.state.redirectLoginPage})
    }

    componentDidMount() {
        let layoutApp = new LayoutApp();
        let PageResponse = layoutApp.PageForNoAuth();
        if (PageResponse.type && PageResponse.type === 'error') {
            this.setState({redirectLoginPage: !this.state.redirectLoginPage})
        } else {
            // Ajax Settings User !!!
            let User = JSON.parse(localStorage.getItem('appState'));
            this.indexHomePage(User);
            this.allNotifications(User);
            this.notificationsWebsocket(User);
        }
    }

    allNotifications(User) {
        if (User) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/allNotifications/' + User.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        notificationsAll: response.data.data.notifications,
                        notificationsNoCheck: response.data.data.notificationsNoCheck
                    })
                }
            })
        }
    }

    notificationsWebsocket(User) {
        if (User) {
            const options = {
                broadcaster: 'pusher',
                key: 'bc2d10d0be0e102bcbe5',
                cluster: 'eu',
                encrypted: true,
                forceTLS: true,
                authEndpoint: '/api/broadcasting/auth',

                // Headers Auth
                auth: {
                    headers: {
                        Authorization: 'Bearer ' + User.user.auth_token,
                        Accept: 'application/json'
                    },
                    params: {
                        token: User.user.auth_token
                    }
                }
            };

            const echo = new Echo(options);

            echo.private('App.User.' + User.user.id)
                .notification(data => {
                    this.state.notificationsAll.unshift(data);
                    this.setState({
                        notificationsAll: this.state.notificationsAll,
                        notificationsNoCheck: this.state.notificationsNoCheck + 1
                    });
                    NotifAppMessage('success', 'You are received a new notification !!!', 'Well Done !!!')
                });
        }
    }

    indexHomePage(User) {
        if (User) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/home/' + User.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        settings: response.data.data.setting,
                        countMeEvents: response.data.data.countMeEvents,
                        countEventsJoin: response.data.data.countEventsJoin,
                        friends: response.data.data.friends,
                        friendsList: Array.isArray(response.data.data.friendsList)
                            ? []
                            : Object.values(response.data.data.friendsList.data)
                    })
                } else {
                    LogoutUser();
                    NotifGlobal('Error User !!!', response.data.message, 'danger', this.onConfirm(), this.onCancel());
                    this.setState({redirectLoginPage: !this.state.redirectLoginPage});
                }
            })
        }
    }

    checkAllNotifications() {
        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                authToken: user.user.auth_token
            };

            axios.post('/api/check/notifications', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    // CODE
                    this.setState({notificationsNoCheck: 0})
                }
            })
        }
    }

    IsValidJSONString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    render() {
        const {menuBar, menuAsideBar, colorBar, menuOption, menuUser, searchBar, friendsList, notifications, notificationsAll, notificationsNoCheck} = this.state;
        if (this.state.redirectLoginPage) {
            return (
                <Redirect to='/login'/>
            )
        }

        let classNameContainer = 'enable-page-overlay side-scroll main-content-boxed side-trans-enabled';

        if (menuBar) {
            classNameContainer = classNameContainer + ' sidebar-o'
        }
        if (menuAsideBar) {
            classNameContainer = classNameContainer + ' side-overlay-o';
        }
        if (colorBar) {
            classNameContainer = classNameContainer + ' sidebar-inverse';
        }
        if (menuOption) {
            classNameContainer = classNameContainer + ' page-header-modern';
        }

        let user = JSON.parse(localStorage.getItem('appState'));

        if (this.state.redirectSearchEvent) {
            return (
                <Redirect to={{
                    pathname: '/event/search',
                    state: {searchInput: this.state.searchInput}
                }}/>
            )
        }

        return (
            <div id='page-container' className={classNameContainer ? classNameContainer : className}>
                <div id="page-overlay"></div>
                <aside id='side-overlay'>
                    <div className="simplebar-wrapper">
                        <div className="simplebar-height-auto-observer-wrapper">
                            <div className="simplebar-height-auto-observer"></div>
                        </div>
                        <div className="simplebar-mask">
                            <div className="simplebar-offset" style={{right: '-15px', bottom: '0px'}}>
                                <div className="simplebar-content-wrapper">
                                    <div className="simplebar-content">
                                        <div className="content-header content-header-fullrow">
                                            <div className="content-header-section align-parent">
                                                <button type="button"
                                                        className="btn btn-circle btn-dual-secondary align-v-r"
                                                        data-toggle="layout" data-action="side_overlay_close"
                                                        onClick={this.handleMenuAsideBar}>
                                                    <i className="fa fa-times text-danger"></i>
                                                </button>
                                                <div className="content-header-item">
                                                    <a className="img-link mr-2" href="be_pages_generic_profile.php">
                                                        <img className="img-avatar img-avatar32"
                                                             src={this.state.settings ? this.state.settings.image_user : imgAvatar}
                                                             alt="Avatar"/>
                                                    </a>
                                                    <a className="align-middle link-effect text-primary-dark font-w600"
                                                       href="#">{user ? user.user.name : ''}</a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="content-side">
                                            <div className="block pull-r-l">
                                                <div
                                                    className="block-content block-content-full block-content-sm bg-body-light">
                                                    <div className="row">
                                                        <div className="col-4">
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">My
                                                                Events
                                                            </div>
                                                            <div
                                                                className="font-size-h4">{this.state.countMeEvents}</div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Events
                                                                join
                                                            </div>
                                                            <div
                                                                className="font-size-h4">{this.state.countEventsJoin}</div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Friends
                                                            </div>
                                                            <div className="font-size-h4">{this.state.friends}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="block pull-r-l">
                                                <div className="block-header bg-body-light">
                                                    <h3 className="block-title">
                                                        <i className="fa fa-fw fa-users font-size-default mr-2"></i>Friends
                                                    </h3>
                                                </div>
                                                <div className="block-content">
                                                    <ul className="nav-users push">
                                                        {
                                                            friendsList.map(d => {
                                                                return (
                                                                    <li>
                                                                        <Link to={'/profile/' + d.username}>
                                                                            <img className="img-avatar"
                                                                                 src={d.setting && d.setting.imageUser ? d.setting.imageUser : imgAvatar}
                                                                                 alt="logo"/>
                                                                            {d.username}
                                                                            <div
                                                                                className="font-w400 font-size-xs text-muted">
                                                                                {d.setting && d.setting.activity ? d.setting.activity : 'Not Activity'}
                                                                            </div>
                                                                        </Link>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="block pull-r-l">
                                                <div className="block-header bg-body-light">
                                                    <h3 className="block-title">
                                                        <i className="fa fa-fw fa-clock-o font-size-default mr-2"></i>Activity
                                                    </h3>
                                                    <div className="block-options">
                                                        <button type="button" className="btn-block-option">
                                                            <i className="fa fa-refresh"></i>
                                                        </button>
                                                        <button type="button" className="btn-block-option">
                                                            <i className="fa fa-arrow-up"></i></button>
                                                    </div>
                                                </div>
                                                <div className="block-content">
                                                    <ul className="list list-activity">
                                                        {
                                                            notificationsAll.map(d => {
                                                                let notificationTypeStyle = new NotificationTypeStyle(d);
                                                                return (
                                                                    <li>
                                                                        <i className={notificationTypeStyle.typeNotificationIconHeader()}></i>
                                                                        <div className="font-w600">
                                                                            {notificationTypeStyle.typeNotificationInfo()}
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                this.IsValidJSONString(d.data) ?
                                                                                    JSON.parse(d.data).data
                                                                                    : d.data
                                                                            }
                                                                            {
                                                                                this.IsValidJSONString(d.data) ?
                                                                                    notificationTypeStyle.typeBoolInfoComment() || notificationTypeStyle.typeBoolEventUser() ?
                                                                                        <a href={'/event/show/' + JSON.parse(d.data).event_slug}>{JSON.parse(d.data).data_href}</a>
                                                                                        :
                                                                                        ''
                                                                                    :
                                                                                    <a href={'/event/show/' + d.event_slug}>{d.data_href}</a>
                                                                            }
                                                                        </div>
                                                                        <div className="font-size-xs text-muted">
                                                                            {moment(d.created_at).fromNow()}
                                                                        </div>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
                <nav id='sidebar'>
                    <div className='simplebar-wrapper'>
                        <div className='simplebar-mask'>
                            <div className='simplebar-offset'>
                                <div className="simplebar-content-wrapper">
                                    <div className='simplebar-content'>
                                        <div className="sidebar-content">
                                            <div className="content-header content-header-fullrow px-15">
                                                <div className="content-header-section sidebar-mini-visible-b">
                                                    <span
                                                        className="content-header-item font-w700 font-size-xl float-left animated fadeIn">
                                                        <span className="text-dual-primary-dark">c</span>
                                                        <span className="text-primary">b</span>
                                                    </span>
                                                </div>
                                                <div
                                                    className="content-header-section text-center align-parent sidebar-mini-hidden">
                                                    <button type="button"
                                                            className="btn btn-circle btn-dual-secondary d-lg-none align-v-r"
                                                            data-toggle="layout" data-action="sidebar_close">
                                                        <i className="fa fa-times text-danger"></i>
                                                    </button>
                                                    <div className="content-header-item">
                                                        <a className="link-effect font-w700" href="index.php">
                                                            <i className="fa fa-fire text-primary"></i>
                                                            <span
                                                                className="font-size-xl text-dual-primary-dark"> Events</span><span
                                                            className="font-size-xl text-primary">Base</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className='content-side content-side-full content-side-user px-10 align-parent'>
                                                <div className="sidebar-mini-hidden-b text-center">
                                                    <a className="img-link" href="#">
                                                        <img className="img-avatar"
                                                             src={this.state.settings ? this.state.settings.image_user : imgAvatar}
                                                             alt="Avatar"/>
                                                    </a>
                                                    <ul className="list-inline mt-10">
                                                        <li className="list-inline-item">
                                                            <a className="link-effect text-dual-primary-dark font-size-xs font-w600 text-uppercase"
                                                               href="#">{user ? user.user.name : ''}</a>
                                                        </li>
                                                        <li className="list-inline-item">
                                                            <a className="link-effect text-dual-primary-dark"
                                                               onClick={this.onChangeColor}>
                                                                <i className="fa fa-tint"></i>
                                                            </a>
                                                        </li>
                                                        <li className="list-inline-item">
                                                            <a className="link-effect text-dual-primary-dark"
                                                               onClick={this.onLogout}>
                                                                <i className="fa fa-sign-out"></i>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="content-side content-side-full">
                                                <ul className="nav-main">
                                                    <li>
                                                        <Link to={'/home'} className="a-hover">
                                                            <i className="fa fa-2x fa-home "></i>
                                                            <span className="sidebar-hide">Home</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={'/notificationsAll'} className="a-hover">
                                                            <i className="fa fa-2x fa-trophy"></i>
                                                            <span className="sidebar-hide">Activites</span>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-main-heading">
                                                        <span className="sidebar-hide">Evenements</span>
                                                    </li>
                                                    <li>
                                                        <Link to='/event/search' className="a-hover">
                                                            <i className="fa fa-2x fa-calendar-check-o"></i>
                                                            <span className="sidebar-hide"> Chercher un evenement</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to='/event/category/sport' className="a-hover">
                                                            <i className="fa fa-2x fa-calendar-times-o"></i>
                                                            <span
                                                                className="sidebar-hide"> Evenement par category</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to='/event/create' className="a-hover">
                                                            <i className="fa fa-2x fa fa-pencil-square-o "></i>
                                                            <span className="sidebar-hide"> Creer un evenement</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to='/my_events' className="a-hover">
                                                            <i className="fa fa-2x fa fa-calendar-o "></i>
                                                            <span className="sidebar-hide"> Mes evenments</span>
                                                        </Link>
                                                    </li>
                                                    <li className="nav-main-heading">
                                                        <span className="sidebar-hide">Mes Friends</span>
                                                    </li>
                                                    <li>
                                                        <Link to={'/my_friends'} className="a-hover">
                                                            <i className="fa fa-2x fa fa-user"></i>
                                                            <span className="sidebar-hide">Mes Amis</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={'/event/search'} className="a-hover">
                                                            <i className="fa fa-2x fa fa-user-plus"></i>
                                                            <span className="sidebar-hide"> Chercher des amis</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={'/list_friends'} className="a-hover">
                                                            <i className="fa fa-2x fa fa-users"></i>
                                                            <span className="sidebar-hide"> liste de mes amis</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <a href="" className="a-hover">
                                                            <i className="fa fa-2x fa fa-commenting-o"></i>
                                                            <span className="sidebar-hide"> Discuter</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <header id="page-header">
                    <div className="content-header">
                        <div className="content-header-section">
                            <button type="button" className="btn btn-circle btn-dual-secondary"
                                    onClick={this.handleMenuBar}>
                                <i className="fa fa-navicon"></i>
                            </button>
                            <button type="button" className="btn btn-circle btn-dual-secondary"
                                    onClick={this.handleBarSearch}>
                                <i className="fa fa-search"></i>
                            </button>
                            <div className="btn-group" role="group">
                                <button type="button" className="btn btn-circle btn-dual-secondary"
                                        onClick={this.handleMenuOption}>
                                    <i className="fa fa-wrench"></i>
                                </button>
                            </div>
                        </div>
                        <div className="content-header-section">
                            <div className="btn-group" role="group">
                                <button type="button" className="btn btn-rounded btn-dual-secondary"
                                        onClick={this.onHandleUser}>
                                    <i className="fa fa-user d-sm-none"></i>
                                    <span className="d-none d-sm-inline-block">{user ? user.user.name : ''}</span>
                                    <i className="fa fa-angle-down ml-2"></i>
                                </button>
                                <div
                                    className={menuUser ? 'dropdown-menu dropdown-menu-right min-width-200 show' :
                                        'dropdown-menu dropdown-menu-right min-width-200'}>
                                    <h5 className="h6 text-center py-10 mb-2 border-b text-uppercase">User</h5>
                                    <Link to={user ? '/profile/' + user.user.name : ''} class="dropdown-item">
                                        <i class="fa fa-user mr-2"></i>
                                        Profile
                                    </Link>
                                    <Link to={user ? '/planning/' + user.user.name : ''}
                                          class="dropdown-item d-flex align-item-center content-between">
                            <span>
                            <i class="fa fa-address-book mr-2"></i>
                                My Planning
                                </span>
                                    </Link>
                                    <a href="#" class="dropdown-item">
                                        <i class="fa fa-pencil-square-o mr-2"></i>
                                        Created Event
                                    </a>
                                    <Link to={'/my_calendar'} class="dropdown-item">
                                        <i class="fa fa-calendar mr-2"></i>
                                        My calendar
                                    </Link>
                                    <div class="dropdown-divider"></div>
                                    {
                                        user ?
                                            <Link class="dropdown-item" to={'/settings/' + user.user.name}>
                                                <i class="fa fa-cog mr-2"></i>
                                                Settings
                                            </Link> : ''
                                    }
                                    <div class="dropdown-divider"></div>
                                    <a onClick={this.onLogout} class="dropdown-item">
                                        <i class="fa fa-sign-out mr-2"></i>
                                        Logout
                                    </a>
                                </div>
                            </div>
                            <div className={notifications ? 'btn-group show' : 'btn-group'} role="group">
                                <button type="button" className="btn btn-rounded btn-dual-secondary"
                                        onClick={this.handleNotification}>
                                    <i className="fa fa-flag"></i>
                                    {
                                        notificationsNoCheck !== 0 ?
                                            <span
                                                className="badge badge-primary badge-pill">{notificationsNoCheck}</span>
                                            : ''
                                    }
                                </button>
                                <div
                                    className={notifications ? 'dropdown-menu dropdown-menu-right min-width-300 style-dropdown-menu show' : 'dropdown-menu dropdown-menu-right min-width-300 style-dropdown-menu'}>
                                    <h5 className="h6 text-center py-10 mb-0 border-b text-uppercase">Notifications</h5>
                                    <ul className="list-unstyled my-20">
                                        {
                                            notificationsAll.map(d => {
                                                let notificationTypeStyle = new NotificationTypeStyle(d);
                                                return (
                                                    <li>
                                                        <a className="text-body-color-dark media mb-15" href="#">
                                                            <div className="ml-3 mr-15">
                                                                <i className={notificationTypeStyle.typeNotificationIconHeader()}></i>
                                                            </div>
                                                            <div className="media-body pr-10">
                                                                <p className="mb-0">
                                                                    {
                                                                        this.IsValidJSONString(d.data) ?
                                                                            JSON.parse(d.data).data
                                                                            : d.data
                                                                    }
                                                                    {
                                                                        this.IsValidJSONString(d.data) ?
                                                                            notificationTypeStyle.typeBoolInfoComment() || notificationTypeStyle.typeBoolEventUser() ?
                                                                                <a href={'/event/show/' + JSON.parse(d.data).event_slug}>{JSON.parse(d.data).data_href}</a>
                                                                                :
                                                                                ''
                                                                            :
                                                                            <a href={'/event/show/' + d.event_slug}>{d.data_href}</a>
                                                                    }
                                                                </p>
                                                                <div
                                                                    className="text-muted font-size-sm font-italic mt-2">
                                                                    {moment(d.created_at).fromNow()}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                    <div className="dropdown-divider"></div>
                                    <Link className="dropdown-item text-center mb-0" to={'/notificationsAll'}>
                                        <i className="fa fa-flag mr-2"></i> View All
                                    </Link>
                                </div>
                            </div>
                            <button type="button" className="btn btn-circle btn-dual-secondary"
                                    onClick={this.handleMenuAsideBar}>
                                <i className="fa fa-tasks"></i>
                            </button>
                        </div>
                    </div>
                    <div id="page-header-search" className={searchBar ? 'overlay-header show' : 'overlay-header'}>
                        <div className="content-header content-header-fullrow">
                            <form action="#" method="post" onSubmit={this.onSubmitSearch}>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <button type="button" className="btn btn-secondary"
                                                onClick={this.handleBarSearch}>
                                            <i className="fa fa-times"></i>
                                        </button>
                                    </div>
                                    <input type="text" className="form-control"
                                           placeholder="Search an user or an event.."
                                           name="search-input" onChange={this.handleChangeInputSearch}/>
                                    <div className="input-group-append">
                                        <button type="submit" className="btn btn-secondary">
                                            <i className="fa fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div id="page-header-loader" className="overlay-header bg-primary">
                        <div className="content-header content-header-fullrow text-center">
                            <div className="content-header-item">
                                <i className="fa fa-sun-o fa-spin text-white"></i>
                            </div>
                        </div>
                    </div>
                </header>
                {user ? this.props.children : ''}
            </div>
        );
    }
}
