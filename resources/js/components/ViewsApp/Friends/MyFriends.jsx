import React, {PureComponent} from "react";
import HeaderHome from "../HeaderHome";

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'

// Import Image Default
import projectImage from '@img/cb-project-promo1.png'
import $ from "jquery";
import {Link} from "react-router-dom";
import moment from "moment";
import ReactPaginate from "react-paginate";
import * as axios from "axios";

export default class MyFriends extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            eventsActive: true,
            eventsJoinActive: false,
            eventsLiveActive: false,

            eventsFriends: [],
            eventsJoinFriends: [],
            eventsFriendsActive: [],
            eventsJoinFriendsActive: [],

            perPage: 0,
            countPage: 0,
            perPageJoinFriends: 0,
            countPageJoinFriends: 0,
            perPageEventsActive: 0,
            countPageEventsActive: 0,
            perPageEventsJoinActive: 0,
            countPageEventsJoinActive: 0
        };
        this.handleClick = this.handleClick.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.handlePageJoinFriendsClick = this.handlePageJoinFriendsClick.bind(this)
    }

    handlePageJoinFriendsClick(data, active = false) {
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
                perPage: active ? this.state.perPageEventsJoinActive : this.state.perPageJoinFriends,
                authToken: user.user.auth_token,
                active: active
            };

            axios.post('/api/pagination/EventsJoinFriends', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    if (active) {
                        this.setState({
                            eventsJoinFriendsActive: Object.values(response.data.data.eventsJoinFriends.data)
                        })
                    } else {
                        this.setState({
                            eventsJoinFriends: Object.values(response.data.data.eventsJoinFriends.data)
                        })
                    }
                }
            })
        }
    }

    handlePageClick(data, active = false) {
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
                perPage: active ? this.state.perPageEventsActive : this.state.perPage,
                authToken: user.user.auth_token,
                active: active
            };

            axios.post('/api/pagination/EventsFriends', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    if (active) {
                        this.setState({
                            eventsFriendsActive: Object.values(response.data.data.eventsFriends.data)
                        })
                    } else {
                        this.setState({
                            eventsFriends: Object.values(response.data.data.eventsFriends.data)
                        })
                    }
                }
            })
        }
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
        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/myFriends/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        // Events State !!!eventsJoinFriendsActive
                        eventsFriends: response.data.data.eventsFriends.data ?
                            Object.values(response.data.data.eventsFriends.data) : [],
                        eventsJoinFriends: response.data.data.eventsJoinFriends.data ?
                            Object.values(response.data.data.eventsJoinFriends.data) : [],
                        eventsFriendsActive: response.data.data.eventsFriendsActive.data ?
                            Object.values(response.data.data.eventsFriendsActive.data) : [],
                        eventsJoinFriendsActive: response.data.data.eventsJoinFriendsActive.data ?
                            Object.values(response.data.data.eventsJoinFriendsActive.data) : [],

                        // PerPage and CountPage for Pagination !!!
                        perPage: response.data.data.eventsFriends.perPage,
                        countPage: response.data.data.eventsFriends.countPage,
                        perPageJoinFriends: response.data.data.eventsJoinFriends.perPage,
                        countPageJoinFriends: response.data.data.eventsJoinFriends.countPage,
                        perPageEventsActive: response.data.data.eventsFriendsActive.perPage,
                        countPageEventsActive: response.data.data.eventsFriendsActive.countPage,
                        perPageEventsJoinActive: response.data.data.eventsJoinFriendsActive.perPage,
                        countPageEventsJoinActive: response.data.data.eventsJoinFriendsActive.countPage
                    })
                } else {
                    //
                }
            })
        }
    }

    handleClick(e) {
        e.preventDefault();
        let id = e.target.getAttribute('id');
        if (id === 'events') {
            this.setState({
                eventsActive: true,
                eventsJoinActive: false,
                eventsLiveActive: false
            })
        } else if (id === 'eventsJoin') {
            this.setState({
                eventsActive: false,
                eventsJoinActive: true,
                eventsLiveActive: false
            })
        } else {
            this.setState({
                eventsActive: false,
                eventsJoinActive: false,
                eventsLiveActive: true
            })
        }
    }

    render() {
        const {
            eventsFriendsActive, eventsJoinFriendsActive,  eventsActive, eventsJoinActive, eventsLiveActive, eventsFriends, eventsJoinFriends, countPage, countPageJoinFriends, countPageEventsActive, countPageEventsJoinActive
        } = this.state;

        return (
            <HeaderHome>
                <main id='main-container'>
                    <div className="content">
                        <div className="msg_help">
                            <div className="msg_info">
                                Vous n\'avez pas toujours pas d\'ami ? Aucun problème, cliquez <Link
                                to={'/event/search'}>ici</Link> pour en rechercher
                            </div>
                        </div>
                        <h2 className="content-heading">Activités de vos amis</h2>
                        <div className="">
                            <div className="p-10 bg-white push">
                                <ul className="nav ul-pre-color">
                                    <li className="nav-items">
                                        <a href="#" className={eventsActive ? "nav-links active" : "nav-links"}
                                           id='events' onClick={this.handleClick}>
                                            <i id='events' className="fa fa-fw fa-book mr-2"></i>
                                            Events Create
                                        </a>
                                    </li>
                                    <li className="nav-items">
                                        <a href="#" className={eventsJoinActive ? "nav-links active" : "nav-links"}
                                           id='eventsJoin' onClick={this.handleClick}>
                                            <i id='eventsJoin' className="fa fa-fw fa-bookmark-o mr-2"></i>
                                            Events Join
                                        </a>
                                    </li>
                                    <li className="nav-items">
                                        <a href="#" className={eventsLiveActive ? "nav-links active" : "nav-links"}
                                           id='eventsLive' onClick={this.handleClick}>
                                            <i id='eventsLive' className="fa fa-fw fa-address-book mr-2"></i>
                                            Events Live
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="row-friend items-push img-fluid-100">
                                <div id="events" className={eventsActive ? "" : "d-none"}>
                                    {
                                        eventsFriends.map(d => {
                                            return (
                                                <div className="col-sm-6 col-md-3">
                                                    <div className="hovereffect">
                                                        <img style={{width: '262px', height: '174px'}}
                                                             className="img-fluid img-thumb"
                                                             src={d.images.length !== 0 ? d.images[0].img_medium : projectImage}
                                                             alt=""/>
                                                        <div className="overlay">
                                                            <h2>{d.title}</h2>
                                                            <Link className="info" to={'/event/show/' + d.slug}
                                                                  data-event={d.id}>link here</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    <div className="col-sm-12 mt-3">
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
                                <div id="events_join" className={eventsJoinActive ? "" : "d-none"}>
                                    {
                                        eventsJoinFriends.map(d => {
                                            return (
                                                <div className="col-sm-6 col-md-3">
                                                    <div className="hovereffect">
                                                        <img style={{width: '262px', height: '174px'}}
                                                             className="img-fluid img-thumb"
                                                             src={d.images.length !== 0 ? d.images[0].img_medium : projectImage}
                                                             alt=""/>
                                                        <div className="overlay">
                                                            <h2>{d.title}</h2>
                                                            <Link className="info" to={'/event/show/' + d.slug}
                                                                  data-event={d.id}>link here</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    <div className="col-sm-12 mt-3">
                                        <ReactPaginate
                                            previousLabel={'Previous'}
                                            nextLabel={'Next'}
                                            breakLabel={'...'}
                                            breakClassName={'break-me'}
                                            pageCount={countPageJoinFriends}
                                            marginPagesDisplayed={2}
                                            pageRangeDisplayed={5}
                                            onPageChange={this.handlePageJoinFriendsClick}
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
                                <div id="event" className={eventsLiveActive ? "" : "d-none"}>
                                    <div className="col-md-12">
                                        <div className="block">
                                            <div
                                                className="block-content block-content-full tab-content overflow-h">
                                                <div className="">
                                                    <div
                                                        className="font-size-h3 font-w600 py-30 mb-20px text-center border-b">
                                                        Events Create Live
                                                    </div>
                                                    <table
                                                        className="table table-border table-hover table-center">
                                                        <thead className="thead-l">
                                                        <tr>
                                                            <th style={{width: '50%'}}>Project</th>
                                                            <th className="table-name text-center"
                                                                style={{width: '15%'}}>Category
                                                            </th>
                                                            <th className="table-name text-center"
                                                                style={{width: '15%'}}>Nombre users
                                                            </th>
                                                            <th className="text-center"
                                                                style={{width: '20%'}}>Created By
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            eventsFriendsActive.map(d => {
                                                                if (this.diffDate(d.date_event)) {
                                                                    return (
                                                                        <tr>
                                                                            <td>
                                                                                <h4 className="h5 mt-15 mb-5">
                                                                                    <Link
                                                                                        to={'/event/show/' + d.slug}>{d.title}</Link>
                                                                                </h4>
                                                                                <p className="d-md-block text-muted">
                                                                                    {d.content}
                                                                                </p>
                                                                            </td>
                                                                            <td className="table-name text-center">
                                                                            <span
                                                                                className="badge badge-success">{d.category}</span>
                                                                            </td>
                                                                            <td className="table-name font-size-xl text-center font-w600">16</td>
                                                                            <td className="text-center">
                                                                                <img className="img-avatar img-avatar48"
                                                                                     src={d.settings.imageUser ? d.settings.imageUser : imgAvatar}
                                                                                     alt=""/>
                                                                                <div
                                                                                    className="font-w600 p-10">{d.username}</div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                        </tbody>
                                                    </table>
                                                    <ReactPaginate
                                                        previousLabel={'Previous'}
                                                        nextLabel={'Next'}
                                                        breakLabel={'...'}
                                                        breakClassName={'break-me'}
                                                        pageCount={countPageEventsActive}
                                                        marginPagesDisplayed={2}
                                                        pageRangeDisplayed={5}
                                                        onPageChange={data => this.handlePageClick(data, true)}
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
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="block">
                                            <div
                                                className="block-content block-content-full tab-content overflow-h">
                                                <div className="">
                                                    <div
                                                        className="font-size-h3 font-w600 py-30 mb-20px text-center border-b">
                                                        Events Live Join
                                                    </div>
                                                    <table
                                                        className="table table-border table-hover table-center">
                                                        <thead className="thead-l">
                                                        <tr>
                                                            <th style={{width: '50%'}}>Project</th>
                                                            <th className="table-name text-center"
                                                                style={{width: '15%'}}>Category
                                                            </th>
                                                            <th className="table-name text-center"
                                                                style={{width: '15%'}}>Nombre users
                                                            </th>
                                                            <th className="text-center"
                                                                style={{width: '20%'}}>Joined By
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            eventsJoinFriendsActive.map(d => {
                                                                if (this.diffDate(d.date_event)) {
                                                                    return (
                                                                        <tr>
                                                                            <td>
                                                                                <h4 className="h5 mt-15 mb-5">
                                                                                    <Link
                                                                                        to={'/event/show/' + d.slug}>{d.title}</Link>
                                                                                </h4>
                                                                                <p className="d-md-block text-muted">
                                                                                    {d.content}
                                                                                </p>
                                                                            </td>
                                                                            <td className="table-name text-center">
                                                                <span
                                                                    className="badge badge-success">{d.category}</span>
                                                                            </td>
                                                                            <td className="table-name font-size-xl text-center font-w600">15</td>
                                                                            <td className="text-center">
                                                                                <img className="img-avatar img-avatar48"
                                                                                     src={d.settings.imageUser ? d.settings.imageUser : imgAvatar}
                                                                                     alt=""/>
                                                                                <div
                                                                                    className="font-w600 p-10">{d.username}</div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                        </tbody>
                                                    </table>
                                                    <ReactPaginate
                                                        previousLabel={'Previous'}
                                                        nextLabel={'Next'}
                                                        breakLabel={'...'}
                                                        breakClassName={'break-me'}
                                                        pageCount={countPageEventsJoinActive}
                                                        marginPagesDisplayed={2}
                                                        pageRangeDisplayed={5}
                                                        onPageChange={data => this.handlePageJoinFriendsClick(data, true)}
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
                                        </div>
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
