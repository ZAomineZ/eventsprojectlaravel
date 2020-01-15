import React, {PureComponent} from "react";
import HeaderHome from "../HeaderHome";
import $ from "jquery";
import * as axios from "axios";

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import {isDate, isString} from "lodash";
import {NotifAppMessage} from "../../LayoutApp";
import DatePicker from "react-datepicker";
import countryList from 'react-select-country-list'

export default class SettingsUser extends PureComponent {
    constructor(props) {
        super(props);
        const user = JSON.parse(localStorage.getItem('appState'));
        this.state = {
            userUpdated: '',
            image: '',

            privateInformation: false,
            secureInformation: true,
            pictureInformation: false,

            username: user ? user.user.name : '',
            email: user ? user.user.email : '',
            password: '',
            password_confirm: '',

            country: '',
            birth_date: new Date(),
            activity: '',
            gender: '',
            bio: '',

            image_profile: null
        };
        this.handleInformationPrivateClick = this.handleInformationPrivateClick.bind(this);
        this.handleInformationSecureClick = this.handleInformationSecureClick.bind(this);
        this.handleInformationPictureClick = this.handleInformationPictureClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmitSecure = this.handleSubmitSecure.bind(this);
        this.handleSubmitPrivate = this.handleSubmitPrivate.bind(this);
        this.handleSubmitPicture = this.handleSubmitPicture.bind(this);
    }

    componentDidMount() {
        const usernameUrl = this.props.match.params.name;
        const user = JSON.parse(localStorage.getItem('appState'));

        if (isString(usernameUrl)) {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/settings/' + usernameUrl + '/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    let user = response.data.data.user;
                    let setting = response.data.data.setting;
                    this.setState({
                        userUpdated: user.updated_at,
                        country: setting.country ? setting.country : '',
                        birth_date: setting.birth_date ? new Date(setting.birth_date) : '',
                        bio: setting.bio ? setting.bio : '',
                        activity: setting.activity ? setting.activity : '',
                        gender: setting.gender ? setting.gender : '',
                        image: setting.image_user ? setting.image_user : ''
                    })
                } else {
                    NotifAppMessage('danger', response.data.data.message, 'Error: Access Page');
                    this.props.history.push('/home');
                }
            })
        }
    }

    handleInformationPrivateClick() {
        this.setState({
            privateInformation: true,
            secureInformation: false,
            pictureInformation: false
        })
    }

    handleInformationSecureClick() {
        this.setState({
            privateInformation: false,
            secureInformation: true,
            pictureInformation: false
        })
    }

    handleInformationPictureClick() {
        this.setState({
            privateInformation: false,
            secureInformation: false,
            pictureInformation: true
        })
    }

    handleChange(e) {
        e.preventDefault();
        const {name, value} = e.target;

        if (name !== 'image_profile') {
            this.setState({
                [name]: value
            });
        } else {
            this.setState({
                image_profile: e.target.files[0]
            });
        }
    }

    handleSubmitSecure(e) {
        e.preventDefault();
        const {username, email, password, password_confirm} = this.state;

        const validEmailRegex =
            RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        const user = JSON.parse(localStorage.getItem('appState'));

        if (username.length > 2 && validEmailRegex.test(email)) {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                username: username,
                email: email,
                password: password,
                password_confirm: password_confirm,
                user: user
            };

            axios.post('/api/settings/secure/' + user.user.name, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    NotifAppMessage('success', 'Yours informations has been updated with success !!!', 'Well done !!!');

                    const newUser = response.data.data.user;

                    let AuthData = {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        auth_token: newUser.auth_token
                    };

                    let appState = {
                        isLoggedIn: true,
                        user: AuthData
                    };

                    localStorage.setItem('appState', JSON.stringify(appState))
                } else {
                    NotifAppMessage('danger', response.data.data.message, 'Error found !!!');
                }
            })
        }
    }

    handleSubmitPrivate(e) {
        e.preventDefault();
        const {country, birth_date, activity, gender, bio} = this.state;

        const user = JSON.parse(localStorage.getItem('appState'));

        if (isDate(birth_date)) {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                country: country,
                birth_date: birth_date,
                activity: activity,
                gender: gender,
                bio: bio,
                user: user
            };

            axios.post('/api/settings/private/' + user.user.name, {
                params: params,
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    NotifAppMessage('success', response.data.data.message, 'Well Done !!!')
                } else {
                    NotifAppMessage('danger', response.data.data.message, 'Error Found !!!!')
                }
            })
        }
    }

    handleSubmitPicture(e) {
        e.preventDefault();
        const {image_profile} = this.state;

        let user = JSON.parse(localStorage.getItem('appState'));

        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'multipart/form-data, application/json',
            "Accept": "multipart/form-data, application/json",
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        const formData = new FormData();
        formData.append('avatar', image_profile);

        const params = {
            user: user
        };

        axios.post('/api/settings/picture/' + user.user.name, formData, {
            headers: headers,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                this.setState({image: response.data.data.avatar.image_user});
                NotifAppMessage('success', response.data.data.message, 'Well done !!!');
                this.props.history.push('/home')
            } else {
                NotifAppMessage('danger', response.data.data.message, 'Error Found !!!')
            }
        })
    }

    render() {
        const {privateInformation, secureInformation, pictureInformation, userUpdated} = this.state;

        const moment = require('moment');

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content">
                        <div className="block block-rounded">
                            <div className="block-content bg-pattern">
                                <div className="py-10 text-center">
                                    <h1 className="h3 mb-2">Parametres du compte</h1>
                                    <p className="mb-10 text-muted">
                                        <em>Dernière modification : {moment(userUpdated).format('MMM D, YYYY')}</em>
                                    </p>
                                    <p>Sur cette page, vous pouvez modifier vos détails personnels afin d\'avoir une
                                        meilleure sécurité</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="p-10 bg-white push">
                                <ul className="nav ul-pre-color">
                                    <li className="nav-items">
                                        <a href={'#'} onClick={this.handleInformationSecureClick}
                                           className={secureInformation ? 'nav-links active' : 'nav-links'}>
                                            <i className="fa fa-fw fa-user mr-2"></i>
                                            Informations personnels
                                        </a>
                                    </li>
                                    <li className="nav-items">
                                        <a href={'#'} onClick={this.handleInformationPrivateClick}
                                           className={privateInformation ? 'nav-links active' : 'nav-links'}>
                                            <i className="fa fa-fw fa-user-circle-o mr-2"></i>
                                            Informations de sécurité
                                        </a>
                                    </li>
                                    <li className="nav-items">
                                        <a href={'#'} onClick={this.handleInformationPictureClick}
                                           className={pictureInformation ? 'nav-links active' : 'nav-links'}>
                                            <i className="fa fa-fw fa-file-image-o mr-2"></i>
                                            Photo de profil
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <div className={secureInformation ? 'block block-themed' : 'block block-themed d-none'}
                                     id="profile">
                                    <div className="tab-content">
                                        <div className="block-header bg-gd-emerald">
                                            <h3 className="block-title text-white">Paramètre du compte</h3>
                                        </div>
                                        <div className="block-content">
                                            <form action="#" method="post" onSubmit={this.handleSubmitSecure}>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <input type="text" className="form-control" name="username"
                                                                   onChange={this.handleChange}
                                                                   value={this.state.username}/>
                                                            <label htmlFor="">Username</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <input type="email" name="email" className="form-control"
                                                                   value={this.state.email}
                                                                   onChange={this.handleChange}/>
                                                            <label htmlFor="">Email</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <input type="password" className="form-control"
                                                                   name="password"
                                                                   onChange={this.handleChange}
                                                                   placeholder="Changer votre password ???"/>
                                                            <label htmlFor="">Password</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <input type="password" name="password_confirm"
                                                                   className="form-control"
                                                                   onChange={this.handleChange}
                                                                   placeholder="Confirm Password..."/>
                                                            <label htmlFor="">Retaper votre password</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <button type="submit" className="btn btn-alt-success">
                                                            <i className="fa fa-plus mr-2"></i>
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className={privateInformation ? 'block block-themed' : 'block block-themed d-none'}
                                     id="info">
                                    <div className="tab-content">
                                        <div className="block-header bg-gd-emerald">
                                            <h3 className="block-title text-white">Information sur vous</h3>
                                        </div>
                                        <div className="block-content">
                                            <form action="" method="post" onSubmit={this.handleSubmitPrivate}>
                                                <div className="form-group row">
                                                    <label className="col-12" htmlFor="example-select">Pays </label>
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <select className="form-control"
                                                                    id="country"
                                                                    name="country"
                                                                    onChange={this.handleChange}>
                                                                {
                                                                    countryList().getData().map(d => {
                                                                        return (
                                                                            <option
                                                                                selected={d.value === this.state.country}
                                                                                value={d.value}>{d.label}</option>
                                                                        )
                                                                    })
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-12" htmlFor="example-textarea-input">Date de
                                                        naissance</label>
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <DatePicker
                                                                selected={this.state.birth_date}
                                                                onChange={date => this.setState({birth_date: date})}
                                                                showTimeSelect
                                                                className='form-control'
                                                                timeIntervals={15}
                                                                timeCaption="time"
                                                                dateFormat='dd/MM/yyyy'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <input type="text"
                                                                   className="form-control"
                                                                   name="activity"
                                                                   value={this.state.activity}
                                                                   onChange={this.handleChange}
                                                                   placeholder="Votre activité ..."/>
                                                            <label htmlFor="">Activité professionel</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-12" htmlFor="gender">Your Gender</label>
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <select className="form-control"
                                                                    id="gender"
                                                                    name="gender" onChange={this.handleChange}>
                                                                <option value="H"
                                                                        selected={this.state.gender === 'H'}>Homme
                                                                </option>
                                                                <option value="F"
                                                                        selected={this.state.gender === 'F'}>Femme
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-12"
                                                           htmlFor="example-textarea-input">Textarea</label>
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <textarea className="form-control" rows="12"
                                                                      value={this.state.bio}
                                                                      name="bio" onChange={this.handleChange}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <button type="submit" className="btn btn-alt-success">
                                                            <i className="fa fa-plus mr-2"></i>
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className={pictureInformation ? 'block block-themed' : 'block block-themed d-none'}
                                     id="photo">
                                    <div className="tab-content">
                                        <div className="block-header bg-gd-emerald">
                                            <h3 className="block-title text-white">Photo Profil</h3>
                                        </div>
                                        <div className="block-content">
                                            <form method="post" encType="multipart/form-data"
                                                  onSubmit={this.handleSubmitPicture}>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <label htmlFor="">Photo actuelle</label>

                                                            <div className="text-center">
                                                                <img
                                                                    src={this.state.image !== '' ? this.state.image : imgAvatar}
                                                                    className="img-avatar" alt={'img-avatar'}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <div className="form-modal">
                                                            <input type="file" id="image_profile"
                                                                   onChange={this.handleChange}
                                                                   name="image_profile"/>
                                                            <label htmlFor="">Nouvelle photo</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <button type="submit" className="btn btn-alt-success">
                                                            <i className="fa fa-plus mr-2"></i>
                                                            Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
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
