import React, {PureComponent} from 'react'
import HeaderHome from "../HeaderHome";
import * as axios from "axios";

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import {Animated} from "react-animated-css";
import $ from "jquery";
import {Link} from "react-router-dom";
import {NotifAppMessage} from "../../LayoutApp";
import ReactPaginate from "react-paginate";

export default class SearchEvent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            typeSearch: 'projects',
            users: [],
            projects: [],
            search: '',
            searchResult: '',
            searchSubmit: false,
            lastPage: 0,
            perPage: 0,
            lastPageUsers: 0,
            perPageUsers: 0,
            countEvents: 0,
            countUsers: 0,

            errors: {
                search: ''
            }
        };
        this.onClickSearchUsers = this.onClickSearchUsers.bind(this);
        this.onClickSearchProjects = this.onClickSearchProjects.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
        this.handlePageUsersClick = this.handlePageUsersClick.bind(this);
    }

    handlePageClick(data) {
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

            axios.post('/api/pagination/Events', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        projects: response.data.data.events
                    })
                }
            })
        }
    }

    handlePageUsersClick(data) {
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
                perPage: this.state.perPageUsers,
                authToken: user.user.auth_token
            };

            axios.post('/api/pagination/Users', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        users: Object.values(response.data.data.users.data)
                    })
                }
            })
        }
    }

    handleAddFriend(event, username) {
        event.preventDefault();

        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: user
            };

            axios.post('/api/addFriend/' + username, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        users: this.state.users.map(d => {
                            if (d.name === username) {
                                return {
                                    email: d.email,
                                    id: d.id,
                                    name: d.name,
                                    settings: d.settings,
                                    friend: {
                                        type_friend: 0
                                    }
                                }
                            }
                            if (d.friend) {
                                return {
                                    email: d.email,
                                    id: d.id,
                                    name: d.name,
                                    settings: d.settings,
                                    friend: d.friend
                                }
                            }
                            return {
                                email: d.email,
                                id: d.id,
                                name: d.name,
                                settings: d.settings
                            }
                        })
                    });
                    NotifAppMessage('success', response.data.message, 'Well Done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning');
                    this.props.history.push('/home')
                }
            })
        }
    }

    handleDeleteFriend(event, username) {
        event.preventDefault();

        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: user
            };

            axios.post('/api/removeFriend/' + username, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        users: this.state.users.map(d => {
                            if (d.name === username) {
                                return {
                                    email: d.email,
                                    id: d.id,
                                    name: d.name,
                                    settings: d.settings
                                }
                            }
                            if (d.friend) {
                                return {
                                    email: d.email,
                                    id: d.id,
                                    name: d.name,
                                    settings: d.settings,
                                    friend: d.friend
                                }
                            }
                            return {
                                email: d.email,
                                id: d.id,
                                name: d.name,
                                settings: d.settings
                            }
                        })
                    });
                    NotifAppMessage('success', response.data.message, 'Well Done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning');
                    this.props.history.push('/home')
                }
            })
        }
    }

    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('appState'));

        if (this.props.location.state === undefined && user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/event/search/index/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        projects: response.data.data.events.data,
                        lastPage: response.data.data.events.last_page,
                        perPage: response.data.data.events.per_page,
                        perPageUsers: response.data.data.users.perPage,
                        lastPageUsers: response.data.data.users.countPage,
                        users: Object.values(response.data.data.users.data)
                    })
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                    this.props.history.push('/login')
                }
            })
        } else {
            return this.ajaxRequest(this.state.search)
        }
    }

    onClickSearchUsers() {
        this.setState({typeSearch: 'users'})
    }

    onClickSearchProjects() {
        this.setState({typeSearch: 'projects'})
    }

    handleChange(e) {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        switch (name) {
            case 'search' :
                errors.search = value.length === 0 ? 'Search Field mustn\'t be empty' :
                    value.length < 3 ? 'Search field must be 3 characters long !' : '';
                break;
            default:
                break
        }

        this.setState({errors, [name]: value});
    }


    ajaxRequest(search) {
        let user = JSON.parse(localStorage.getItem('appState'));

        if (!user) {
            NotifAppMessage('danger', 'You must to connect for do this action !!!', 'Warning !!!')
            this.props.history.push('/login')
        }

        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        const params = {
            search: this.props.location.state === undefined
                ? search
                : search.length !== 0
                    ? search
                    : this.props.location.state.searchInput,
            authToken: user.user.auth_token
        };

        axios.post('/api/event/search', {
            headers: headers,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                this.setState({
                    projects: response.data.data.events.data,
                    users: response.data.data.users.data ?
                        Object.values(response.data.data.users.data)
                        : [],
                    lastPage: response.data.data.events.last_page,
                    perPage: response.data.data.events.per_page,
                    perPageUsers: response.data.data.users.perPage,
                    lastPageUsers: response.data.data.users.countPage,
                    searchSubmit: true,
                    searchResult: this.props.location.state === undefined
                        ? search
                        : search.length !== 0
                            ? search
                            : this.props.location.state.searchInput,
                    countEvents: response.data.data.countEvents,
                    countUsers: response.data.data.countUsers
                })
            }
        })
    }

    onSubmit(event) {
        event.preventDefault();
        const {search, errors} = this.state;

        if (this.validForm(errors)) {
            return this.ajaxRequest(search)
        }
    };

    validForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }

    render() {
        const {typeSearch, users, projects, errors, searchSubmit, searchResult, countEvents, countUsers, lastPage, lastPageUsers} = this.state;

        let localState = JSON.parse(localStorage.getItem('appState'));

        return (
            <HeaderHome>
                <main id='main-container'>
                    <div className="content">
                        <h2 className='content-heading'>Search Projects</h2>
                        <form className="push" method="post" onSubmit={this.onSubmit}>
                            <div className="input-group input-group-lg">
                                <input type="text"
                                       className={errors.search.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                       name='search' onChange={this.handleChange}
                                       placeholder="Search projects or friends..."/>
                                {
                                    errors.search.length > 0 &&
                                    <div
                                        className={errors.search.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                        {errors.search}
                                    </div>
                                }
                                <div className="input-group-append">
                                    <button type="submit" className="btn btn-secondary" style={{height: '40px'}}>
                                        <i className="fa fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="block">
                            <ul className="nav nav-tabs nav-tabs-block react-tabs"
                                role="tablist">
                                <li className="nav-item" onClick={this.onClickSearchProjects}>
                                    <a className={typeSearch === 'projects' ? 'nav-link active' : 'nav-link'}>Events</a>
                                </li>
                                <li className="nav-item" onClick={this.onClickSearchUsers}>
                                    <a className={typeSearch === 'users' ? 'nav-link active' : 'nav-link'}>Users</a>
                                </li>
                            </ul>
                            <div className='block-content block-content-full tab-content overflow-hidden'>
                                <Animated animationIn="fadeIn" animationOut="fadeOut" isVisible={true}
                                          className={typeSearch === 'projects' ? 'tab-pane fade active show' : 'tab-pane fade'}
                                          id="search-projects" role="tabpanel">
                                    {
                                        searchSubmit !== false ?
                                            <div className="font-size-h3 font-w600 py-30 mb-20 text-center border-b">
                                                <span className="text-primary font-w700">{countEvents}</span> events
                                                found for
                                                <mark className="text-danger">{searchResult}</mark>
                                            </div>
                                            :
                                            <div className="font-size-h3 font-w600 py-30 mb-20 text-center border-b">
                                                <span className="text-primary font-w700">The</span> last events found
                                            </div>
                                    }
                                    <table
                                        className="table table-striped table-borderless table-hover table-vcenter">
                                        <thead className="thead-light">
                                        <tr>
                                            <th style={{width: '35%'}}>Events</th>
                                            <th className="d-none d-lg-table-cell text-center"
                                                style={{width: '15%'}}>Date Event
                                            </th>
                                            <th className="d-none d-lg-table-cell text-center"
                                                style={{width: '15%'}}>Place
                                            </th>
                                            <th className="d-none d-lg-table-cell text-center"
                                                style={{width: '15%'}}>Type Event
                                            </th>
                                            <th className="d-none d-lg-table-cell text-center"
                                                style={{width: '15%'}}>Category
                                            </th>
                                            <th className="d-none d-lg-table-cell text-center"
                                                style={{width: '20%'}}>By
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            projects.map(d => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <h4 className="h5 mt-15 mb-5">
                                                                <Link to={'/event/show/' + d.slug}>{d.title}</Link>
                                                            </h4>
                                                            <p className="d-none d-sm-block text-muted">
                                                                {d.content}
                                                            </p>
                                                        </td>
                                                        <td className="d-none d-lg-table-cell d-sm-block text-center">{d.date_event}</td>
                                                        <td className="d-none d-lg-table-cell d-sm-block text-lg-center">{d.place}</td>
                                                        <td className="d-none d-lg-table-cell text-center">
                                                            <span
                                                                className={d.type_event === 'private' ? 'badge badge-danger' : 'badge badge-success'}>{d.type_event}</span>
                                                        </td>
                                                        <td className="d-none d-lg-table-cell d-sm-block text-center">{d.category.name}</td>
                                                        <td className="d-none d-lg-table-cell d-sm-block text-center">
                                                            {d.user.id === localState.user.id ? 'Me' : d.user.name}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    </table>
                                    <div className="col-md-6">
                                        <ReactPaginate
                                            previousLabel={'Previous'}
                                            nextLabel={'Next'}
                                            breakLabel={'...'}
                                            breakClassName={'break-me'}
                                            pageCount={lastPage}
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
                                </Animated>
                                <Animated animationIn="fadeIn" animationOut="fadeOut" isVisible={true}
                                          className={typeSearch === 'users' ? 'tab-pane fade active show' : 'tab-pane fade'}
                                          id="search-users" role="tabpanel">
                                    {
                                        searchSubmit !== false ?
                                            <div className="font-size-h3 font-w600 py-30 mb-20 text-center border-b">
                                                <span className="text-primary font-w700">{countUsers}</span> users
                                                found for
                                                <mark className="text-danger">{searchResult}</mark>
                                            </div>
                                            :
                                            <div className="font-size-h3 font-w600 py-30 mb-20 text-center border-b">
                                                <span className="text-primary font-w700">The</span> last users found
                                            </div>
                                    }
                                    <table
                                        className="table table-striped table-borderless table-hover table-vcenter">
                                        <thead className="thead-light">
                                        <tr>
                                            <th className="d-none d-sm-table-cell text-center"
                                                style={{width: '40px'}}>
                                            </th>
                                            <th className="text-center" style={{width: '70px'}}><i
                                                className="fa fa-user"></i></th>
                                            <th>Name</th>
                                            <th className="d-none d-sm-table-cell">Email</th>
                                            <th className="d-none d-lg-table-cell" style={{width: '15px'}}>Work
                                            </th>
                                            <th className="text-center" style={{width: '80px'}}>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            users.map((d, key) => {
                                                return (
                                                    <tr>
                                                        <td className="d-none d-sm-table-cell text-center">
                                                            <span
                                                                className="badge badge-pill badge-primary">{key + 1}</span>
                                                        </td>
                                                        <td className="text-center">
                                                            <img className="img-avatar img-avatar48"
                                                                 src={d.settings.length > 0 ?
                                                                     d.settings[0].image_user !== '' ?
                                                                         d.settings[0].image_user :
                                                                         imgAvatar :
                                                                     imgAvatar}
                                                                 alt=""/>
                                                        </td>
                                                        <td className="font-w600">
                                                            <Link to={'/profile/' + d.name}>{d.name}</Link>
                                                        </td>
                                                        <td className="d-none d-sm-table-cell">
                                                            {d.email}
                                                        </td>
                                                        <td className="d-none d-lg-table-cell">
                                                            <span
                                                                className="badge badge-info">
                                                                {
                                                                    d.settings.length > 0 ?
                                                                        d.settings[0].activity
                                                                            ? d.settings[0].activity
                                                                            : 'Not activity'
                                                                        : 'Not activity'
                                                                }
                                                                </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group">
                                                                <Link to={'/profile/' + d.name}
                                                                      className="btn btn-sm btn-secondary react-enabled">
                                                                    <i className="fa fa-user"></i>
                                                                </Link>
                                                                {
                                                                    d.id !== localState.user.id ?
                                                                        d.friend && d.friend.type_friend === 1 ?
                                                                            <button type="button"
                                                                                    onClick={e => this.handleDeleteFriend(e, d.name)}
                                                                                    className="btn btn-sm btn-secondary react-enabled">
                                                                                <i className="fa fa-times"></i>
                                                                            </button>
                                                                            :
                                                                            d.friend && d.friend.type_friend === 0 ?
                                                                                <button type="button"
                                                                                        className="btn btn-sm btn-secondary react-enabled">
                                                                                    <i className="fa fa-envelope"></i>
                                                                                </button>
                                                                                :
                                                                                <button type="button"
                                                                                        onClick={e => this.handleAddFriend(e, d.name)}
                                                                                        className="btn btn-sm btn-secondary react-enabled">
                                                                                    <i className="fa fa-plus"></i>
                                                                                </button>
                                                                        : ''
                                                                }
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    </table>
                                    <div className="col-md-6">
                                        <ReactPaginate
                                            previousLabel={'Previous'}
                                            nextLabel={'Next'}
                                            breakLabel={'...'}
                                            breakClassName={'break-me'}
                                            pageCount={lastPageUsers}
                                            marginPagesDisplayed={2}
                                            pageRangeDisplayed={5}
                                            onPageChange={this.handlePageUsersClick}
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
                                </Animated>
                            </div>
                        </div>
                    </div>
                </main>
            </HeaderHome>
        );
    }
}
