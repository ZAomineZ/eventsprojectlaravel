import React, {PureComponent} from 'react'
import HeaderHome from "../HeaderHome";
import * as axios from "axios";
import ReactPaginate from 'react-paginate';

// Import Image Default
import projectImage from '@img/cb-project-promo1.png'

// Animate Css
import {Animated} from "react-animated-css";
import $ from "jquery";
import {Link} from "react-router-dom";

export default class MyEvents extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            events: [],
            pageCountEvents: 0,
            perPage: 0,
            keyCategory: 0,
            activeEvents: 0,
            eventsCount: 0,
            friendsParticipated: 0
        };
        this.onClick = this.onClick.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this)
    }

    onClick(event) {
        let categoryId = event.target.attributes.getNamedItem('data-id').value;
        const user = JSON.parse(localStorage.getItem('appState'));

        if (categoryId && user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'multipart/form-data, application/json',
                "Accept": "multipart/form-data, application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };
            axios.post('/api/my_events/filter/', {
                headers: headers,
                params: {
                    categoryId: categoryId,
                    authToken: user.user.auth_token
                }
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        events: response.data.data.events.data,
                        activeEvents: response.data.data.dataActive,
                        eventsCount: response.data.data.countEvents,
                        friendsParticipated: response.data.data.friendsParticipated,
                        last_page: response.data.data.events.last_page,
                        perPage: response.data.data.events.per_page,
                        keyCategory: parseInt(categoryId),
                    });
                }
            })
        }
    }

    componentDidMount() {
        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            axios.get('/api/my_events/' + user.user.auth_token, {
                headers: headers
            }).then((response) => {
                if (response.data.success === true) {
                    this.setState({
                        categories: response.data.data.categories,
                        events: response.data.data.events.data,
                        last_page: response.data.data.events.last_page,
                        perPage: response.data.data.events.per_page,
                        friendsParticipated: response.data.data.friendsParticipated,
                        activeEvents: response.data.data.dateActive,
                        eventsCount: response.data.data.countEvents
                    });
                }
            })
        }
    }

    handlePageClick(data)
    {
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
              authToken: user.user.auth_token,
              category: this.state.keyCategory
            };

            axios.post('/api/pagination/MyEvents', {
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

    render() {
        const {events, last_page, friendsParticipated} = this.state;

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content content-full">
                        <h2 className='content-heading'>Yours Projects</h2>
                        <div className='filter-react filter-react-enabled'>
                            <div className='p-10 bg-white push'>
                                <ul className='nav nav-pills justify-content-center'>
                                    <li className='nav-item'>
                                        <a data-id={0} onClick={this.onClick}
                                           className={this.state.keyCategory === 0 ? 'nav-link active' : 'nav-link'}>
                                            <i data-id={0} className='fa fa-fw fa-th-large mr-2'></i>
                                            All
                                        </a>
                                    </li>
                                    {
                                        this.state.categories.map((d, key) => {
                                            return (
                                                <li className='nav-item'>
                                                    <a data-id={key + 1} onClick={this.onClick}
                                                       className={d.id === this.state.keyCategory ? 'nav-link active' : 'nav-link'}>
                                                        <i data-id={key + 1} className='fa fa-fw fa-th-large mr-2'></i>
                                                        {d.name}
                                                    </a>
                                                </li>
                                            )
                                        })
                                    }
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
                                        pageCount={last_page}
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
                            <div className='bg-white push'>
                                <div className="row text-center">
                                    <div className="col-sm-4 py-30">
                                        <div
                                            className="font-size-h1 font-w700 text-black js-count-react">{this.state.activeEvents}</div>
                                        <div className="font-w600 text-muted text-uppercase">Active</div>
                                    </div>
                                    <div className="col-sm-4 py-30">
                                        <div
                                            className="font-size-h1 font-w700 text-black js-count-react">{this.state.eventsCount}</div>
                                        <div className="font-w600 text-muted text-uppercase">Events</div>
                                    </div>
                                    <div className="col-sm-4 py-30">
                                        <div className="font-size-h1 font-w700 text-black js-count-react">
                                            {friendsParticipated}
                                        </div>
                                        <div className="font-w600 text-muted text-uppercase">Friends Participate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </HeaderHome>
        );
    }
}
