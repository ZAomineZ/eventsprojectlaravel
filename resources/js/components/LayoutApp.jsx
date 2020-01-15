import React, {PureComponent} from 'react';
import SweetAlert from "react-bootstrap-sweetalert/dist/components/SweetAlert";
import NotificationSystem from "rc-notification";

import Home from "./Home";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import ForgetPassoword from "./Auth/PasswordForget";
import ForgetPassowordConfirmToken from "./Auth/PasswordForgetConfirmToken";

import HomeApp from "./ViewsApp/Home";
import MyEvents from "./ViewsApp/Events/MyEvents";
import CreateEvent from "./ViewsApp/Events/CreateEvent";
import UpdateEvent from "./ViewsApp/Events/UpdateEvent";
import SearchMap from "./ViewsApp/Events/SearchMap";
import SearchEvent from './ViewsApp/Events/SearchEvent';
import ProfileUser from './ViewsApp/Profile/ProfileUser';
import SettingsUser from './ViewsApp/Profile/SettingsUser';
import MeComments from './ViewsApp/Comment/MeComments';
import MeJoinEvents from './ViewsApp/Events/MeJoinEvents';

import {Redirect, Route} from "react-router-dom";
import Cookie from 'react-cookies';
import $ from "jquery";
import ShowEvent from "./ViewsApp/Events/ShowEvent";
import ShowEventCategory from "./ViewsApp/Events/ShowEventCategory";
import NotificationLoad from "./NotificationLoad";
import ListFriends from "./ViewsApp/Friends/ListFriends";
import MyFriends from "./ViewsApp/Friends/MyFriends";
import MyCalendar from "./ViewsApp/Calendar/MyCalendar";
import EventsAllByUser from "./ViewsApp/Events/EventsAllByUser";
import FriendsAllByUser from "./ViewsApp/Friends/FriendsAllByUser";
import NotificationsAll from "./ViewsApp/Notifications/NotificationsAll";
import PlaningUsername from "./ViewsApp/Planning/PlaningUsername";

let notification = null;

const showNotification = (title, message, type, onConfirm, onCancel) => {
    notification.notice({
        content: <SweetAlert danger={type === 'danger'} success={type === 'success'} title={title}
                             onConfirm={onConfirm}
                             onCancel={onCancel}
                             style={{top: '50px', left: '50px'}}>
            {message}
        </SweetAlert>,
        duration: 5,
        closable: true,
        style: {top: 0, left: 0, bottom: 0, right: 0}
    });
};

export function NotifGlobal(title, message, type, onConfirm, onCancel) {
    NotificationSystem.newInstance({}, n => notification = n);
    setTimeout(() => showNotification(title, message, type, onConfirm, onCancel), 700);
}

export function NotifAppMessage(type, message, title) {
    const showNotificationApp = (title, message, type) => {
        notification.notice({
            content: <NotificationLoad title={title} message={message} type={type}/>,
            duration: 10,
            closable: true,
            style: {top: 0, left: 0, bottom: 0, right: 0}
        });
    };

    NotificationSystem.newInstance({}, n => notification = n);
    setTimeout(() => showNotificationApp(title, message, type), 700);
}

export function LogoutUser() {
    let localeStorageJson = JSON.parse(localStorage.getItem('appState'));
    if (localeStorageJson && localeStorageJson.isLoggedIn === true) {
        // Clean Storage and DELETE Cookie auth Cookie
        localStorage.removeItem('appState');
        Cookie.remove('authCookie');
    }
}

export const TOKEN_MAP_REACT = 'pk.eyJ1IjoiYmx1dXAtYTBtaW5lIiwiYSI6ImNrM3B2ZjJuajA0aHIzZ3BydmRxOGI5MWoifQ.xpKFmB4viRW8seQjW2Ck3g';

class LayoutApp extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            onConfirm: false,
            onCancel: false,
            redirectHomePage: false
        }
    }

    onConfirm() {
        this.setState({onConfirm: !this.state.onConfirm})
    }

    onCancel() {
        this.setState({onCancel: !this.state.onCancel})
    }

    PageForNoAuth() {
        let localeStorageJson = JSON.parse(localStorage.getItem('appState'));
        if (!localeStorageJson || localeStorageJson.isLoggedIn !== true) {
            NotifGlobal('Error Found !!!', 'You must be connected for acceded this page !!!', 'danger', this.onConfirm(), this.onCancel());
            return {type: 'error'}
        }
        return {type: 'success'}
    }

    PageForAuth() {
        let localeStorageJson = JSON.parse(localStorage.getItem('appState'));
        if (localeStorageJson && localeStorageJson.isLoggedIn === true) {
            NotifGlobal('Error Found !!!', 'You are already connected !!!', 'danger', this.onConfirm(), this.onCancel());
            return {type: 'error'}
        }
        return {type: 'success'}
    }

    componentDidMount() {
        let localeStorageJson = JSON.parse(localStorage.getItem('appState'));
        if (localeStorageJson && localeStorageJson.isLoggedIn === true) {
            //
        } else {
            if (Cookie.load('authCookie')) {
                this.reconnectCookie(Cookie.load('authCookie'))
            }
        }
    }

    reconnectCookie(rememberToken) {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        axios.get('/api/rememberCookie/' + rememberToken, {
            headers: headers
        }).then((response) => {
            const dataUser = response.data.data;

            let AuthData = {
                id: dataUser.id,
                name: dataUser.name,
                email: dataUser.email,
                auth_token: dataUser.auth_token
            };

            let appState = {
                isLoggedIn: true,
                user: AuthData
            };

            localStorage['appState'] = JSON.stringify(appState);
            this.setState({redirectHomePage: !this.state.redirectHomePage});
        })
    }

    render() {
        return (
            <div>
                {
                    this.state.redirectHomePage ? <Redirect to='/home'/> : ''
                }
                <Route exact path='/' component={Home}/>
                <Route path='/register' component={Register}/>
                <Route path='/login' component={Login}/>
                <Route path='/forget_password' component={ForgetPassoword}/>
                <Route path='/password_forgot_confirm/:authToken' component={ForgetPassowordConfirmToken}/>
                <Route path='/home' component={HomeApp}/>
                <Route path='/my_events' component={MyEvents}/>
                <Route path='/event/create' component={CreateEvent}/>
                <Route path='/event/update/:slug' component={UpdateEvent}/>
                <Route path='/map/event/:slug' component={SearchMap}/>
                <Route path='/event/search' component={SearchEvent}/>
                <Route path='/event/show/:slug' component={ShowEvent}/>
                <Route path='/event/category/:category' component={ShowEventCategory} />
                <Route path='/profile/:name' component={ProfileUser}/>
                <Route path='/settings/:name' component={SettingsUser}/>
                <Route path='/me_comments' component={MeComments}/>
                <Route path='/me_join_events' component={MeJoinEvents}/>
                <Route path='/list_friends' component={ListFriends}/>
                <Route path='/my_friends' component={MyFriends}/>
                <Route path='/my_calendar' component={MyCalendar}/>
                <Route path='/eventsAll/:username' component={EventsAllByUser}/>
                <Route path='/friendsAll/:username' component={FriendsAllByUser}/>
                <Route path='/notificationsAll' component={NotificationsAll}/>
                <Route path='/planning/:username' component={PlaningUsername}/>
            </div>
        )
    }
}

export default LayoutApp;
