import React, {PureComponent} from 'react';
import HeaderHome from "../HeaderHome";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import $ from "jquery";
import * as axios from 'axios';
import ModalCreateActivityPlanning from "./ModalCreateActivityPlanning";
import ModalDeleteActivityPlanning from "./ModalDeleteActivityPlanning";
import {NotifAppMessage} from "../../LayoutApp";

export default class PlaningUsername extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            plannings: [],
            dateClickDay: new Date(),
            alert: false,
            planningDelete: false,

            // Input State Modal
            activity: '',
            hours: new Date(),

            planningIdDelete: 0
        };
        this.handleClickEvent = this.handleClickEvent.bind(this);
        this.handleDropEvent = this.handleDropEvent.bind(this);
        this.handleClickDay = this.handleClickDay.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const {activity, dateClickDay, hours} = this.state;
            const username = this.props.match.params.username;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                activity: activity,
                date: dateClickDay,
                hour: hours
            };

            axios.post('/api/planning/' + username + '/' + user.user.auth_token, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    const activity = response.data.data.activity;

                    let planningState = {
                        id: activity.id,
                        start: new Date(activity.date_activity),
                        title: activity.title
                    };

                    this.setState({
                        plannings: [...this.state.plannings, planningState],
                        alert: !this.state.alert
                    });
                    NotifAppMessage('success', response.data.data.message, 'Well done !!!')
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    handleDelete(e) {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const {planningIdDelete} = this.state;
            const username = this.props.match.params.username;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                planningId: parseInt(planningIdDelete)
            };

            axios.post('/api/planning/delete/' + username + '/' + user.user.auth_token, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success) {
                    let planning = response.data.data.planning;
                    this.setState({
                        plannings: this.state.plannings.filter(d => d.id !== planning.id),
                        planningIdDelete: 0,
                        planningDelete: false
                    });

                    NotifAppMessage('success', response.data.data.message, 'Well Done !!!');
                } else {
                    NotifAppMessage('danger', response.data.data.message, 'Warning !!!');
                }
            })
        }
    }

    handleClickDay(event) {
        this.setState({
            dateClickDay: event.date,
            alert: !this.state.alert
        });
    }

    handleDropEvent(data) {
        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const planningId = data.event.id;
            const username = this.props.match.params.username;

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
              planningId: parseInt(planningId),
              datePlanning: data.event.start
            };

            axios.post('/api/planning/drop/' + username + '/' + user.user.auth_token, {
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

    handleClickEvent(data) {
        this.setState({
            planningDelete: !this.state.planningDelete,
            planningIdDelete: data.event.id
        })
    }

    handleChange(e) {
        this.setState({
            activity: e.target.value
        })
    }

    handleChangeDate(date) {
        this.setState({hours: date})
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/planning/' + username + '/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        plannings: response.data.data.plannings.map(d => {
                            return {
                                id: d.id,
                                start: new Date(d.date_activity),
                                title: d.title
                            }
                        })
                    })
                }
            })
        }
    }

    render() {
        const user = JSON.parse(localStorage.getItem('appState'));
        const username = this.props.match.params.username;

        return (
            <HeaderHome>
                <main>
                    <div className="content">
                        <div className="block-header block-header-default">
                            <h3 className="block-title">
                                Your Planning
                            </h3>
                        </div>
                        <div className="block">
                            <div className="block-content">
                                <div className="row items-push">
                                    <div className="col-xl-12">
                                        <FullCalendar
                                            defaultView="dayGridMonth"
                                            header={{
                                                left: "prev,next today",
                                                center: "title",
                                                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                                            }}
                                            rerenderDelay={10}
                                            eventDurationEditable={false}
                                            editable={user && user.user.name === username}
                                            droppable={user && user.user.name === username}
                                            eventTextColor='#fff'
                                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                            events={this.state.plannings}
                                            eventDrop={user && user.user.name === username ? this.handleDropEvent: ''}
                                            eventClick={user && user.user.name === username ? this.handleClickEvent : ''}
                                            dateClick={user && user.user.name === username ? this.handleClickDay : ''}
                                        />
                                        {
                                            this.state.alert ?
                                                <ModalCreateActivityPlanning
                                                    handleNoneModal={() => this.setState({alert: !this.state.alert})}
                                                    hours={this.state.hours}
                                                    handleChange={this.handleChange}
                                                    handleChangeDate={this.handleChangeDate}
                                                    handleSubmit={this.handleSubmit}/>
                                                : ''
                                        }
                                        {
                                            this.state.planningDelete ?
                                                <ModalDeleteActivityPlanning
                                                    handleNoneModal={() =>
                                                        this.setState({planningDelete: !this.state.planningDelete})
                                                    }
                                                    handleDelete={this.handleDelete}/>
                                                : ''
                                        }
                                        <div
                                            className={this.state.alert || this.state.planningDelete ? 'modal-backdrop fade show' : ''}></div>
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
