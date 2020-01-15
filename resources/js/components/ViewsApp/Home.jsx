import React, {PureComponent} from 'react'
import HeaderHome from "./HeaderHome";
import $ from "jquery";
import * as axios from "axios";
import {Link} from "react-router-dom";

export default class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            events: 0,
            me_events: 0,
            me_comments: 0,
            activities: 0,
            join_events: 0,
            active_join_events: 0,
            friendsCount: 0,
            eventsFriendsCount: 0,
            eventsFriendsJoinCount: 0,
            eventsFriendsActiveCount: 0,
            eventsFriendsJoinActiveCount: 0,
            usersCount: 0,
            usersActiveCount: 0,
            loading: true,
            loaded: false
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

            axios.get('/api/homePage/' + user.user.id, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        events: response.data.data.events,
                        me_events: response.data.data.me_events,
                        me_comments: response.data.data.me_comments,
                        activities: response.data.data.me_activities,
                        join_events: response.data.data.join_events,
                        active_join_events: response.data.data.active_join_events,
                        friendsCount: response.data.data.friendsCount,
                        eventsFriendsCount: response.data.data.eventsFriendsCount,
                        eventsFriendsJoinCount: response.data.data.eventsFriendsJoinCount,
                        eventsFriendsActiveCount: response.data.data.eventsFriendsActiveCount,
                        eventsFriendsJoinActiveCount: response.data.data.eventsFriendsJoinActiveCount,
                        usersCount: response.data.data.usersCount,
                        usersActiveCount: response.data.data.usersActiveCount,
                        loading: false
                    });
                    setTimeout(() => this.setState({loaded: true}), 500);
                }
            })
        }
    }

    render() {
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
                {
                    user ?
                        <main id="main-container">
                            <div className="content">
                                <div className="row js-appear-enabled animated fadeIn">
                                    <div className="col-6 col-xl-3">
                                        <Link className="block block-link-shadow text-right" to={'/event/search'}>
                                            <div className="block-content block-content-full clearfix">
                                                <div className="float-left mt-10 d-none d-sm-block">
                                                    <i className="fa fa-book fa-3x text-body-bg-dark"></i>
                                                </div>
                                                <div className="font-size-h3 font-w600 js-count-to-enabled"
                                                     data-toggle="countTo" data-speed="1000"
                                                     data-to={this.state.events}>{this.state.events}
                                                </div>
                                                <div
                                                    className="font-size-sm font-w600 text-uppercase text-muted">Events
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-xl-3">
                                        <Link className="block block-link-shadow text-right" to={'/my_events'}>
                                            <div className="block-content block-content-full clearfix">
                                                <div className="float-left mt-10 d-none d-sm-block">
                                                    <i className="fa fa-address-book fa-3x text-body-bg-dark"></i>
                                                </div>
                                                <div className="font-size-h3 font-w600">
                                            <span data-toggle="countTo"
                                                  data-speed="1000" data-to={this.state.me_events}
                                                  className="js-count-to-enabled">{this.state.me_events}</span>
                                                </div>
                                                <div className="font-size-sm font-w600 text-uppercase text-muted">My
                                                    Events
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-xl-3">
                                        <Link to={'/me_comments'} className="block block-link-shadow text-right">
                                            <div className="block-content block-content-full clearfix">
                                                <div className="float-left mt-10 d-none d-sm-block">
                                                    <i className="fa fa-comments fa-3x text-body-bg-dark"></i>
                                                </div>
                                                <div className="font-size-h3 font-w600 js-count-to-enabled"
                                                     data-toggle="countTo" data-speed="1000"
                                                     data-to={this.state.me_comments}>{this.state.me_comments}
                                                </div>
                                                <div className="font-size-sm font-w600 text-uppercase text-muted">My
                                                    Comments
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-xl-3">
                                        <Link className="block block-link-shadow text-right" to={'/notificationsAll'}>
                                            <div className="block-content block-content-full clearfix">
                                                <div className="float-left mt-10 d-none d-sm-block">
                                                    <i className="fa fa-flag fa-3x text-body-bg-dark"></i>
                                                </div>
                                                <div className="font-size-h3 font-w600 js-count-to-enabled"
                                                     data-toggle="countTo" data-speed="1000" data-to="60">{this.state.activities}
                                                </div>
                                                <div
                                                    className="font-size-sm font-w600 text-uppercase text-muted">Activities
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="row js-appear-enabled animated fadeIn">
                                    <div className="col-md-6">
                                        <Link className="block block-link-shadow overflow-hidden" to={'/me_join_events'}>
                                            <div className="block-content block-content-full">
                                                <i className="fa fa-calendar-check-o fa-2x text-body-bg-dark"></i>
                                                <div className="row py-20">
                                                    <div className="col-6 text-right border-r">
                                                        <div className="js-appear-enabled animated fadeInLeft">
                                                            <div className="font-size-h3 font-w600">{this.state.join_events}</div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted"> Events
                                                                Join
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="js-appear-enabled animated fadeInRight">
                                                            <div className="font-size-h3 font-w600">{this.state.active_join_events}</div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Active
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-md-6">
                                        <Link className="block block-link-shadow overflow-hidden" to={'/my_friends'}>
                                            <div className="block-content block-content-full">
                                                <div className="text-right">
                                                    <i className="fa fa-calendar-check-o fa-2x text-body-bg-dark mr-33-rem"></i>
                                                    <i className="fa fa-users fa-2x text-body-bg-dark"></i>
                                                </div>
                                                <div className="row py-20">
                                                    <div className="col-6 text-right border-r">
                                                        <div className="js-appear-enabled animated fadeInLeft">
                                                            <div className="font-size-h3 font-w600 text-info">
                                                                {this.state.eventsFriendsJoinCount}
                                                            </div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Friends
                                                                Events
                                                                Join
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="js-appear-enabled animated fadeInRight">
                                                            <div className="font-size-h3 font-w600 text-success">
                                                                {this.state.eventsFriendsJoinActiveCount}
                                                            </div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Active
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="row js-appear-enabled animated fadeIn">
                                    <div className="col-md-6">
                                        <Link className="block block-link-shadow overflow-hidden" to={'/my_friends'}>
                                            <div className="block-content block-content-full">
                                                <div className="text-right">
                                                    <i className="fa fa-calendar fa-2x text-body-bg-dark mr-33-rem"></i>
                                                    <i className="fa fa-users fa-2x text-body-bg-dark"></i>
                                                </div>
                                                <div className="row py-20">
                                                    <div className="col-6 text-right border-r">
                                                        <div className="js-appear-enabled animated fadeInLeft">
                                                            <div className="font-size-h3 font-w600">
                                                                {this.state.eventsFriendsCount}
                                                            </div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Friends Events
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="js-appear-enabled animated fadeInRight">
                                                            <div className="font-size-h3 font-w600">
                                                                {this.state.eventsFriendsActiveCount}
                                                            </div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Active
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-md-6">
                                        <Link className="block block-link-shadow overflow-hidden" to={'/event/search'}>
                                            <div className="block-content block-content-full">
                                                <div className="text-right">
                                                    <i className="fa fa-users fa-2x text-body-bg-dark"></i>
                                                </div>
                                                <div className="row py-20">
                                                    <div className="col-6 text-right border-r">
                                                        <div className="js-appear-enabled animated fadeInLeft">
                                                            <div className="font-size-h3 font-w600 text-info">
                                                                {this.state.usersCount}
                                                            </div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Accounts
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="js-appear-enabled animated fadeInRight">
                                                            <div className="font-size-h3 font-w600 text-success">
                                                                {
                                                                    (this.state.usersActiveCount / this.state.usersCount) * 100
                                                                }
                                                                %
                                                            </div>
                                                            <div
                                                                className="font-size-sm font-w600 text-uppercase text-muted">Active
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="row js-appear-enabled animated fadeIn">
                                    <div className="col-6 col-md-4 col-xl-2">
                                        <Link className="block block-link-shadow text-center" to={'/list_friends'}>
                                            <div
                                                className="block-content ribbon ribbon-bookmark ribbon-success ribbon-left">
                                                <div className="ribbon-box">{this.state.friendsCount}</div>
                                                <p className="mt-5">
                                                    <i className="fa fa-users fa-3x"></i>
                                                </p>
                                                <p className="font-w600">Friends</p>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-md-4 col-xl-2">
                                        <Link className="block block-link-shadow text-center"
                                              to={'/profile/' + user.user.name}>
                                            <div className="block-content">
                                                <p className="mt-5">
                                                    <i className="fa fa-user fa-3x"></i>
                                                </p>
                                                <p className="font-w600">Profile</p>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-md-4 col-xl-2">
                                        <Link className="block block-link-shadow text-center" to={'/event/search'}>
                                            <div className="block-content">
                                                <p className="mt-5">
                                                    <i className="fa fa-user-plus fa-3x"></i>
                                                </p>
                                                <p className="font-w600">Search Friend</p>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-md-4 col-xl-2">
                                        <Link className="block block-link-shadow text-center" to={'/event/search'}>
                                            <div className="block-content">
                                                <p className="mt-5">
                                                    <i className="fa fa-search fa-3x"></i>
                                                </p>
                                                <p className="font-w600">Search</p>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-md-4 col-xl-2">
                                        <Link className="block block-link-shadow text-center" to={'/my_calendar'}>
                                            <div className="block-content">
                                                <p className="mt-5">
                                                    <i className="fa fa-calendar fa-3x"></i>
                                                </p>
                                                <p className="font-w600">My Calendar</p>
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="col-6 col-md-4 col-xl-2">
                                        <Link className="block block-link-shadow text-center"
                                              to={'/settings/' + user.user.name}>
                                            <div className="block-content">
                                                <p className="mt-5">
                                                    <i className="fa fa-cog fa-3x"></i>
                                                </p>
                                                <p className="font-w600">Settings</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main> : ''
                }
            </HeaderHome>
        )
    }
}
