import React, {PureComponent} from "react";
import {Animated} from "react-animated-css";
import {Link} from "react-router-dom";
import ReactPaginate from "react-paginate";
import HeaderHome from "../HeaderHome";
import {isString} from "lodash";
import $ from "jquery";
import * as axios from "axios";

// Import Image Default
import projectImage from '@img/cb-project-promo1.png'

export default class EventsAllByUser extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            perPage: 0,
            countPage: 0,
            username: '',

            // State Status
            all: true,
            active: false,
            noActive: false
        };
        this.handlePageClick = this.handlePageClick.bind(this);
        this.onClickActive = this.onClickActive.bind(this);
        this.onClickNoActive = this.onClickNoActive.bind(this);
        this.onClickAll = this.onClickAll.bind(this);
    }

    handlePageClick(data, typeEvents) {
        let selected = data.selected;
        let user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

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
                authToken: user.user.auth_token,
                typeEvents: typeEvents
            };

            axios.post('/api/pagination/allEvents/' + username, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        events: response.data.data.events
                    })
                }
            })
        }
    }

    onClickActive(e)
    {
        e.preventDefault();
        this.setState({
            all: false,
            active: true,
            noActive: false
        });

        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        return this.requestEventsActive(user, username)
    }

    onClickNoActive(e)
    {
        e.preventDefault();
        this.setState({
            all: false,
            active: false,
            noActive: true
        });

        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        return this.requestEventsNoActive(user, username)
    }

    onClickAll(e)
    {
        e.preventDefault();
        this.setState({
            all: true,
            active: false,
            noActive: false
        });

        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        return this.requestEventsAll(user, username)
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        return this.requestEventsAll(user, username)
    }

    requestEventsAll(user, username) {
        if (user) {
            if (isString(username) && username.length !== 0) {
                const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                };

                axios.get('/api/eventsAll/' + username + '/' + user.user.auth_token, {
                    headers: headers
                }).then(response => {
                    if (response.data.success === true) {
                        this.setState({
                            events: response.data.data.events.data,
                            perPage: response.data.data.events.per_page,
                            countPage: response.data.data.events.last_page,
                            username: response.data.data.username
                        })
                    }
                })
            }
        }
    }

    requestEventsActive(user, username)
    {
        if (user) {
            if (isString(username) && username.length !== 0) {
                const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                };

                axios.get('/api/eventsActiveFriends/' + username + '/' + user.user.auth_token, {
                    headers: headers
                }).then(response => {
                    if (response.data.success === true) {
                        this.setState({
                            events: response.data.data.events.data,
                            perPage: response.data.data.events.per_page,
                            countPage: response.data.data.events.last_page
                        })
                    }
                })
            }
        }
    }

    requestEventsNoActive(user, username)
    {
        if (user) {
            if (isString(username) && username.length !== 0) {
                const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                };

                axios.get('/api/eventsNoActiveFriends/' + username + '/' + user.user.auth_token, {
                    headers: headers
                }).then(response => {
                    if (response.data.success === true) {
                        this.setState({
                            events: response.data.data.events.data,
                            perPage: response.data.data.events.per_page,
                            countPage: response.data.data.events.last_page
                        })
                    }
                })
            }
        }
    }

    render() {
        const {events, countPage, username, all, active, noActive} = this.state;

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content content-full">
                        <h2 className='content-heading'>The Projects to "{username}"</h2>
                        <div className='filter-react filter-react-enabled'>
                            <div className='p-10 bg-white push'>
                                <ul className='nav nav-pills justify-content-center'>
                                    <li className='nav-item'>
                                        <a onClick={this.onClickAll}
                                           className={all ? 'nav-link active' : 'nav-link'}>
                                            <i className='fa fa-fw fa-th-large mr-2'></i>
                                            All
                                        </a>
                                    </li>
                                    <li className='nav-item'>
                                        <a onClick={this.onClickActive}
                                           className={active ? 'nav-link active' : 'nav-link'}>
                                            <i className='fa fa-fw fa-th-large mr-2'></i>
                                            Active
                                        </a>
                                    </li>
                                    <li className='nav-item'>
                                        <a onClick={this.onClickNoActive}
                                           className={noActive ? 'nav-link active' : 'nav-link'}>
                                            <i className='fa fa-fw fa-th-large mr-2'></i>
                                            No Active
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className={'row items-push img-fluid-100'}>
                                {
                                    events.map((d) => {
                                        return (
                                            <Animated animationIn="bounceInLeft" animationOut="fadeOut"
                                                      isVisible={true} className={'col-sm-6 col-md-3'}>
                                                <Link className="img-link" to={'/event/show/' + d.slug}>
                                                    <img className="img-fluid img-thumb"
                                                         src={d.images.length === 0 ? projectImage : d.images[0].img_medium}
                                                         alt={d.title}/>
                                                </Link>
                                            </Animated>
                                        )
                                    })
                                }
                                <div className="col-md-12">
                                    <ReactPaginate
                                        previousLabel={'Previous'}
                                        nextLabel={'Next'}
                                        breakLabel={'...'}
                                        breakClassName={'break-me'}
                                        pageCount={countPage}
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={5}
                                        onPageChange={data => this.handlePageClick(data, all ? 'all' : active ? 'active' : 'noActive')}
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
                </main>
            </HeaderHome>
        );
    }
}
