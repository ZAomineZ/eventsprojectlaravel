import React, {PureComponent} from "react";
import {Animated} from "react-animated-css";
import {Link} from "react-router-dom";
import HeaderHome from "../HeaderHome";
import {NotifAppMessage} from "../../LayoutApp";
import {isString} from "lodash";
import * as axios from "axios";
import $ from "jquery";

// Import Image Default
import projectImage from '@img/cb-project-promo1.png'
import ReactPaginate from "react-paginate";

export default class ShowEventCategory extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            categories: [],
            activeEvents: 0,
            eventsCount: 0,
            perPage: 0,
            countPage: 0,
            categoryValue: ''
        };
        this.handleChangeSelected = this.handleChangeSelected.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    handlePageClick(data)
    {
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
                authToken: user.user.auth_token,
                category: this.props.match.params.category
            };

            axios.post('/api/pagination/EventsCategory', {
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

    handleChangeSelected(event) {
        this.setState({categoryValue: event.target.value});
    }

    handleSubmit(event)
    {
        event.preventDefault();
        const category = this.props.match.params.category;

        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'multipart/form-data, application/json',
            "Accept": "multipart/form-data, application/json",
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        const params = {
            categoryId: this.state.categoryValue
        };

        axios.post('/api/event/category/' + category, {
            headers: headers,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                this.props.history.push('/event/category/' + response.data.data.category);
                this.setState({
                    events: response.data.data.events.data,
                    perPage: response.data.data.events.per_page,
                    countPage: response.data.data.events.last_page,
                    categories: response.data.data.categories,
                    activeEvents: response.data.data.activeEvents,
                    eventsCount: response.data.data.eventsCount
                })
            }
        })
    }

    componentDidMount() {
        const category = this.props.match.params.category;
        if (isString(category) && category.length > 0) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'multipart/form-data, application/json',
                "Accept": "multipart/form-data, application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };
            axios.get('/api/event/category/' + category, {
                headers: headers
            }).then((response) => {
                if (response.data.success === true) {
                    this.setState({
                        events: response.data.data.events.data,
                        perPage: response.data.data.events.per_page,
                        countPage: response.data.data.events.last_page,
                        categories: response.data.data.categories,
                        activeEvents: response.data.data.activeEvents,
                        eventsCount: response.data.data.eventsCount
                    })
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                    this.props.history.push('/home')
                }
            })
        } else {
            NotifAppMessage('danger', 'Impossible access Page !!!', 'Error found !!!');
            this.props.history.push('/home');
        }
    }

    render() {
        const category = this.props.match.params.category;
        const {countPage} = this.state;

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content content-full">
                        <h2 className='content-heading'>The Events on the category "{category}"</h2>
                        <form action="#" method='post' onSubmit={this.handleSubmit}>
                            <div className="form-group row">
                                <label className="col-lg-2 col-form-label" htmlFor="category">Select your
                                    category</label>
                                <div className="col-lg-3">
                                    <select className="form-control" id="category" name="category"
                                            onChange={this.handleChangeSelected}>
                                        {
                                            this.state.categories.map(d => {
                                                return (
                                                    <option value={d.id}
                                                            selected={d.slug === category}>{d.name}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div className='col-lg-2'>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </div>
                            </div>
                        </form>
                        <div className={'row items-push img-fluid-100'}>
                            {
                                this.state.events.map((d) => {
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
                        </div>
                        <div className="col-md-6">
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
                                    <div className="font-w600 text-muted text-uppercase">Projects</div>
                                </div>
                                <div className="col-sm-4 py-30">
                                    <div className="font-size-h1 font-w700 text-black js-count-react">{category}</div>
                                    <div className="font-w600 text-muted text-uppercase">Category</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </HeaderHome>
        )
    }
}
