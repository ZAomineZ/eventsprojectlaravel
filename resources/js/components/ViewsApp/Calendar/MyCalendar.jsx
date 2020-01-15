import React, {PureComponent} from "react";
import HeaderHome from "../HeaderHome";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {Draggable} from "@fullcalendar/interaction";
import ModalCreateEvent from "./ModalCreateEvent";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import $ from "jquery";
import * as axios from 'axios';

import {PointCloudLayer} from "deck.gl";
import {Link} from "react-router-dom";
import {NotifAppMessage} from "../../LayoutApp";
import ModalUpdateEvent from "./ModalUpdateEvent";

export default class MyCalendar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            calendarEvents: [],
            activeModalCreateEvent: false,
            activeModalUpdateEvent: false,
            categories: [],
            eventClick: null,

            // Input State
            title: '',
            date: new Date(),
            place: '',
            positionPlace: [],
            user_max: 2,
            category_id: 1,
            type_event: 'public',
            content: '',
            slug: '',
            images: [],

            viewport: {
                latitude: 0,
                longitude: 0,
                zoom: 1
            },
            searchResultCity: null
        };
        this.handleToggleCreateEvent = this.handleToggleCreateEvent.bind(this);
        this.handleNoneModal = this.handleNoneModal.bind(this);
        this.handleNoneUpdateModal = this.handleNoneUpdateModal.bind(this);
        this.handleOnResultPlace = this.handleOnResultPlace.bind(this);
        this.handleChangeViewport = this.handleChangeViewport.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubmitUpdate = this.handleSubmitUpdate.bind(this);
        this.handleDropEvent = this.handleDropEvent.bind(this);
        this.handleClickEvent = this.handleClickEvent.bind(this);
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

            axios.get('/api/myCalendar/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        categories: response.data.data.categories,
                        calendarEvents: response.data.data.events.map(d => {
                            return {
                                id: d.id,
                                start: new Date(d.date_event),
                                title: d.title,
                                slug: d.slug
                            }
                        })
                    })
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                    this.props.history.push('/login')
                }
            })
        }
    }

    handleToggleCreateEvent(e) {
        e.preventDefault();
        $('body').addClass('modal-open');
        this.setState({activeModalCreateEvent: !this.state.activeModalCreateEvent})
    }

    handleNoneModal(e) {
        e.preventDefault();
        $('body').removeClass('modal-open');
        this.setState({activeModalCreateEvent: false})
    }

    handleNoneUpdateModal(e) {
        e.preventDefault();
        $('body').removeClass('modal-open');
        this.setState({activeModalUpdateEvent: false});

        // Reset by default State Input Form and Event !!!
        this.setState({
            title: '',
            date: new Date(),
            place: '',
            positionPlace: [],
            user_max: 2,
            category_id: 1,
            type_event: 'public',
            content: '',
            slug: '',
            images: [],
            eventClick: null,
            searchResultCity: null
        })
    }

    handleOnResultPlace(event) {
        // Set State for the place and the position place to Event !!!
        this.setState({
            place: event.result.place_name,
            positionPlace: event.result.geometry
        });

        // Add Point for data Position Place !!!
        this.setState({
            searchResultCity: new PointCloudLayer({
                id: "search-result",
                data: event.result.geometry,
                getFillColor: [255, 0, 0, 128],
                getRadius: 1000,
                pointRadiusMinPixels: 30,
                pointRadiusMaxPixels: 30,
                transitions: {
                    getLineColor: 1000,
                    getLineWidth: 1000
                }
            })
        })
    };

    handleChangeViewport(viewport) {
        this.setState({
            viewport: {...this.state.viewport, ...viewport}
        })
    }

    handleChangeDate(date) {
        this.setState({date: date})
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleSubmitUpdate(e) {
        e.preventDefault();
        const {title, date, place, positionPlace, user_max, category_id, type_event, content, slug, viewport} = this.state;

        let user = localStorage.getItem('appState');

        if (user) {
            const params = {
                title: title,
                date_event: date,
                place: place,
                positionPlace: positionPlace,
                users_max: user_max,
                category_id: category_id,
                type_event: type_event,
                content: content,
                user: user,
                viewport: viewport
            };

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.post('/api/event/update/' + slug, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    // CODE
                    const slugify = require('slugify');

                    this.setState({
                        // Update Event State :
                        calendarEvents: this.state.calendarEvents.map(d => {
                            if (d.slug === slug) {
                                return {
                                    id: d.id,
                                    start: new Date(date),
                                    title: title,
                                    slug: slugify(title)
                                }
                            } else {
                                return {
                                    id: d.id,
                                    start: d.start,
                                    title: d.title,
                                    slug: d.slug
                                }
                            }
                        })
                    });
                    this.handleNoneUpdateModal(e);
                    NotifAppMessage('success', response.data.data.message, 'Well Done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                }
            })
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const {title, date, place, positionPlace, user_max, category_id, type_event, content, viewport} = this.state;

        let user = localStorage.getItem('appState');

        if (user) {
            const params = {
                title: title,
                date_event: date,
                place: place,
                positionPlace: positionPlace,
                users_max: user_max,
                category_id: category_id,
                type_event: type_event,
                content: content,
                user: user,
                viewport: viewport
            };

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.post('/api/event/create', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    const event = response.data.data.event;

                    let eventState = {
                        id: event.id,
                        start: new Date(event.date_event),
                        title: event.title,
                        slug: event.slug
                    };

                    this.setState({
                        calendarEvents: [...this.state.calendarEvents, eventState],
                        activeModalCreateEvent: !this.state.activeModalCreateEvent
                    });
                    NotifAppMessage('success', response.data.data.message, 'Well done !!!')
                } else {
                    NotifAppMessage('danger', response.data.error, 'Warning !!!')
                }
            })
        }
    }

    handleDropEvent(info) {
        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                newDateEvent: info.event.start,
                idEvent: info.event.id
            };

            axios.post('/api/dropEvent', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    NotifAppMessage('success', response.data.message, 'Well Done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    handleClickEvent(eventClick) {
        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                idEvent: eventClick.event.id
            };

            axios.post('/api/eventClick', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    // CODE !!!
                    $('body').addClass('modal-open');
                    this.setState({
                        eventClick: response.data.data.event,
                        activeModalUpdateEvent: !this.state.activeModalUpdateEvent,
                    });

                    // Change State Attributes Form
                    const {eventClick} = this.state;
                    let positionPlace = eventClick.position_places[0].position;
                    let viewport = JSON.parse(eventClick.position_places[0].viewport);

                    let implodePosition = positionPlace.split(',');
                    let parseFloatPosition = [];

                    // Parse Float the strings positions !!!
                    implodePosition.map(d => {
                        parseFloatPosition.push(parseFloat(d))
                    });

                    // Set Position and Type Place in the Data !!!
                    let coordinates = {};
                    coordinates['type'] = "Point";
                    coordinates['coordinates'] = parseFloatPosition;

                    this.setState({
                        title: eventClick.title,
                        slug: eventClick.slug,
                        date: new Date(eventClick.date_event),
                        place: eventClick.place,
                        user_max: eventClick.users_max,
                        category_id: eventClick.category_id,
                        type_event: eventClick.type_event,
                        content: eventClick.content,
                        images: eventClick.images,
                        positionPlace: coordinates
                    });

                    // Viewport State !!!
                    let newViewport = {
                        altitude: viewport.altitude,
                        bearing: viewport.bearing,
                        height: viewport.height,
                        latitude: viewport.latitude,
                        longitude: viewport.longitude,
                        maxPitch: viewport.maxPitch,
                        maxZoom: viewport.maxZoom,
                        minPitch: viewport.minPitch,
                        minZoom: viewport.minZoom,
                        pitch: viewport.pitch,
                        zoom: viewport.zoom,
                    };

                    this.setState({
                        viewport: {...this.state.viewport, ...newViewport}
                    });

                    // Update Position place on Map Event !!!
                    this.setState({
                        searchResultCity: new PointCloudLayer({
                            id: "search-result",
                            data: coordinates,
                            getFillColor: [255, 0, 0, 128],
                            getRadius: 1000,
                            pointRadiusMinPixels: 30,
                            pointRadiusMaxPixels: 30,
                            transitions: {
                                getLineColor: 1000,
                                getLineWidth: 1000
                            }
                        })
                    })
                } else {
                    NotifAppMessage('success', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    myMap = React.createRef();

    render() {
        const {
            activeModalCreateEvent, activeModalUpdateEvent, categories, viewport, searchResultCity, date, eventClick
        } = this.state;

        return (
            <HeaderHome>
                <main>
                    <div className="content">
                        <div className="block">
                            <div className="block-content">
                                <div className="row items-push">
                                    <div className="col-xl-9">
                                        <FullCalendar
                                            defaultView="dayGridMonth"
                                            header={{
                                                left: "prev,next today",
                                                center: "title",
                                                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                                            }}
                                            rerenderDelay={10}
                                            eventDurationEditable={false}
                                            editable={true}
                                            droppable={true}
                                            eventTextColor='#fff'
                                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                            events={this.state.calendarEvents}
                                            eventDrop={this.handleDropEvent}
                                            eventClick={this.handleClickEvent}
                                        />
                                    </div>
                                    <div className="col-xl-3 d-none d-xl-block">
                                        <form action="#" method="post">
                                            <div className="input-group">
                                                <div className="input-group-app">
                                                    <em className="font-size-xs text-muted">
                                                        <i className="fa fa-calendar mr-2"></i>
                                                        Toujours pas d'events, cliquez
                                                        <Link to={'/event/create'} className=""> ici</Link> afin d'en
                                                        créer un ou :
                                                    </em>
                                                </div>
                                            </div>
                                        </form>
                                        <div className="text-center" style={{top: '10px'}}>
                                            <div className="btn-float btn-float-event">
                                                <div role="button" className="btn-i btn-i-event"
                                                     onClick={this.handleToggleCreateEvent}
                                                     data-toggle="modal"
                                                     data-target="#modal_event">
                                                    <content className="icon-btn">
                                                        <i className="fa fa-plus icon-font"></i>
                                                    </content>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        activeModalCreateEvent &&
                                        <ModalCreateEvent
                                            handleNoneModal={this.handleNoneModal}
                                            categories={categories}
                                            viewport={viewport}
                                            myMap={this.myMap}
                                            date={date}
                                            searchResultCity={searchResultCity}
                                            handleOnResultPlace={this.handleOnResultPlace}
                                            handleChangeViewport={this.handleChangeViewport}
                                            handleChangeDate={this.handleChangeDate}
                                            handleChange={this.handleChange}
                                            handleSubmit={this.handleSubmit}
                                            activeModalCreateEvent={activeModalCreateEvent}/>
                                    }
                                    {
                                        eventClick &&
                                        <ModalUpdateEvent
                                            activeModalUpdateEvent={activeModalUpdateEvent}
                                            handleNoneModal={this.handleNoneUpdateModal}
                                            handleOnResultPlace={this.handleOnResultPlace}
                                            handleChangeViewport={this.handleChangeViewport}
                                            handleChangeDate={this.handleChangeDate}
                                            handleChange={this.handleChange}
                                            handleSubmit={this.handleSubmitUpdate}
                                            categories={categories}
                                            viewport={viewport}
                                            myMap={this.myMap}
                                            searchResultCity={searchResultCity}
                                            date={date}
                                            titleEvent={this.state.title}
                                            slugEvent={this.state.slug}
                                            placeEvent={this.state.place}
                                            userMaxEvent={this.state.user_max}
                                            categoryIdEvent={this.state.category_id}
                                            typeEvent={this.state.type_event}
                                            contentEvent={this.state.content}
                                            imagesEvent={this.state.images}/>
                                    }
                                    <div
                                        className={activeModalCreateEvent || activeModalUpdateEvent ? 'modal-backdrop fade show' : ''}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </HeaderHome>
        )
    }
}
