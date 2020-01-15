import React, {PureComponent} from 'react';
import HeaderHome from "../HeaderHome";
import DatePicker from 'react-datepicker';
import {NotifAppMessage, TOKEN_MAP_REACT} from '../../LayoutApp';

import "react-datepicker/dist/react-datepicker.css";
import "react-dropzone-uploader/dist/styles.css";

import ReactMapGL, {GeolocateControl, NavigationControl} from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";
import DeckGL, {PointCloudLayer} from "deck.gl";

// Import Image Default
import projectImage from '@img/cb-project-promo1.png';
import {Icon, Upload, Button} from "antd";
import "antd/dist/antd.css";
import * as axios from "axios";
import $ from "jquery";

const geolocateStyle = {
    float: 'left',
    margin: '50px',
    padding: '10px'
};

export default class CreateEvent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            date: new Date(),
            place: '',
            positionPlace: [],
            user_max: 2,
            category_id: 1,
            type_event: 'public',
            content: '',
            categories: [],

            errors: {
                title: '',
                date: '',
                content: ''
            },

            viewport: {
                latitude: 0,
                longitude: 0,
                zoom: 1
            },
            searchResultCity: null,

            onCancel: false,
            onConfirm: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleChangeViewport = this.handleChangeViewport.bind(this);
        this.handleOnResult = this.handleOnResult.bind(this);

        this.handleRemoveImage = this.handleRemoveImage.bind(this);
    }

    handleRemoveImage(file)
    {
        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'multipart/form-data, application/json',
                "Accept": "multipart/form-data, application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            let formData = new FormData();
            formData.append('file', file.originFileObj);
            formData.append('authToken', user.user.auth_token);

            axios.post('/api/event/create/picture/delete', formData, {
                headers: headers
            }).then(response => {
                if (response.data.success && response.data.success === false) {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    componentDidMount() {
        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'multipart/form-data, application/json',
            "Accept": "multipart/form-data, application/json",
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        let user = JSON.parse(localStorage.getItem('appState'));

        axios.get('/api/event/create/' + user.user.auth_token, {
            headers: headers
        }).then((response => {
            if (response.data.success === true) {
                this.setState({categories: response.data.data.categories})
            } else if (response.data.exception === true) {
                NotifAppMessage('danger', response.data.data.message, 'Error Found !!!')
            }
        }))
    }

    handleSubmit(event) {
        event.preventDefault();

        const {title, date, place, positionPlace, user_max, category_id, type_event, content, errors, viewport} = this.state;

        if (this.validForm(errors)) {
            const params = {
                title: title,
                date_event: date,
                place: place,
                positionPlace: positionPlace,
                viewport: viewport,
                users_max: user_max,
                category_id: category_id,
                type_event: type_event,
                content: content,
                user: localStorage.getItem('appState')
            };

            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'multipart/form-data, application/json',
                "Accept": "multipart/form-data, application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.post('/api/event/create', {
                headers: headers,
                params: params,
            }).then((response) => {
                if (response.data.success === true) {
                    // Notification Message And Redirect Home Page
                    NotifAppMessage('success', response.data.data.message, 'Well Done !!!');
                    this.props.history.push('/home');
                } else {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                }
            })
        }
    }

    myMap = React.createRef();

    onChange(event) {
        this.setState({files: event.fileList});
    }

    handleChangeViewport(viewport) {
        this.setState({
            viewport: {...this.state.viewport, ...viewport}
        })
    }

    handleOnResult(event) {
        this.setState({
            place: event.result.place_name,
            positionPlace: event.result.geometry
        });
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

    handleChange(e) {
        const {name, value} = e.target;
        let errors = this.state.errors;

        switch (name) {
            case 'title' :
                errors.title = value.length === 0 ? 'Title Field mustn\'t be empty' :
                    value.length < 10 ? 'Title Field must be 10 characters long !' : '';
                break;
            case 'content' :
                errors.content =
                    value.length === 0 ? 'Content Field mustn\'t be empty' :
                        value.length < 15 ? 'Content must be 15 characters long !' : '';
                break;
            default:
                break
        }

        this.setState({errors, [name]: value});
    }

    validForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }

    onConfirm() {
        this.setState({onConfirm: !this.state.onConfirm})
    }

    onCancel() {
        this.setState({onCancel: !this.state.onCancel})
    }

    render() {
        const {viewport, searchResultCity, errors, categories} = this.state;

        let user = JSON.parse(localStorage.getItem('appState'));

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content">
                        <h2 className='content-heading'>Create a project</h2>
                        <div className="block">
                            <div className="block-header block-header-default">
                                <h3 className="block-title">Your Event</h3>
                                <div className="block-options">
                                    <button className="btn-block-option" type="button">
                                        <i className="fa fa-wrench"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="block-content">
                                <div className="row justify-center py-20">
                                    <div className="col-xl-6">
                                        <div className="block-content block-content-full">
                                            <form action="#" method="post" encType="multipart/form-data"
                                                  onSubmit={this.handleSubmit}>
                                                <h2 className="content-heading">Your Place</h2>
                                                <div style={{margin: '0 auto'}}>
                                                    <h2 style={{
                                                        textAlign: 'center',
                                                        fontSize: '25px',
                                                        fontWeight: 'bolder'
                                                    }}>GeoLocator: Search a location (City or Country)</h2>
                                                    <ReactMapGL
                                                        ref={this.myMap}
                                                        {...viewport}
                                                        mapStyle="mapbox://styles/mapbox/streets-v9"
                                                        width="500px"
                                                        height="500px"
                                                        mapboxApiAccessToken={TOKEN_MAP_REACT}
                                                    >
                                                        <Geocoder
                                                            mapRef={this.myMap}
                                                            onResult={this.handleOnResult}
                                                            onViewportChange={this.handleChangeViewport}
                                                            mapboxApiAccessToken={TOKEN_MAP_REACT}
                                                        />
                                                        <DeckGL {...viewport} layers={[searchResultCity]}
                                                                style={{position: 'relative'}}/>
                                                    </ReactMapGL>
                                                </div>
                                                <h2 className="content-heading">Yours informations</h2>
                                                <div className="form-group row">
                                                    <label className="col-lg-4 col-form-label" htmlFor="title">
                                                        Titre
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-lg-8">
                                                        <input type="text"
                                                               className={errors.title.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                               name="title"
                                                               onChange={this.handleChange}
                                                               placeholder="Entrer le titre"/>
                                                        {
                                                            errors.title.length > 0 &&
                                                            <div
                                                                className={errors.title.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                                {errors.title}
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-lg-4 col-form-label" htmlFor="date_contenu">
                                                        Date et heure
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-lg-8">
                                                        <DatePicker
                                                            selected={this.state.date}
                                                            onChange={date => this.setState({date: date})}
                                                            showTimeSelect
                                                            timeFormat='HH:mm'
                                                            className={errors.date.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                            timeIntervals={15}
                                                            timeCaption="time"
                                                            dateFormat='MMMM d, yyyy h:mm aa'
                                                        />
                                                        {
                                                            errors.date.length > 0 &&
                                                            <div
                                                                className={errors.date.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                                {errors.date}
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-lg-4 col-form-label" htmlFor="place">
                                                        Utilisateur max
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control" name="user_max" id="users"
                                                                onChange={this.handleChange}>
                                                            <option value="2">2</option>
                                                            <option value="4">4</option>
                                                            <option value="6">6</option>
                                                            <option value="8">8</option>
                                                            <option value="12">12</option>
                                                            <option value="16">16</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-lg-4 col-form-label" htmlFor="place">
                                                        Categorie
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control" name="category_id" id="users"
                                                                onChange={this.handleChange}>
                                                            {
                                                                categories.map(d => {
                                                                    return (
                                                                        <option value={d.id}>{d.name}</option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-group row">
                                                    <label className="col-lg-4 col-form-label" htmlFor="type">
                                                        Type event
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control" name="type_event"
                                                                onChange={this.handleChange}>
                                                            <option value='public'>Public</option>
                                                            <option value='private'>Private</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <h2 className="content-heading">Your Description</h2>
                                                <textarea name="content"
                                                          onChange={this.handleChange}
                                                          className={errors.content.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                          rows='8' placeholder='Your content...'/>
                                                {
                                                    errors.content.length > 0 &&
                                                    <div
                                                        className={errors.content.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                        {errors.content}
                                                    </div>
                                                }

                                                <h2 className="content-heading">Ajouts d\'images</h2>
                                                <div className="">
                                                    {
                                                        user ?
                                                            <Upload action={'/api/event/created/' + user.user.id}
                                                                    onRemove={this.handleRemoveImage}
                                                                    listType='picture'
                                                                    className='upload-list-inline' name='file'>
                                                                <Button>
                                                                    <Icon type="upload"/> Upload
                                                                </Button>
                                                            </Upload>
                                                            : ''
                                                    }
                                                </div>

                                                <button className='btn btn-primary mt-5'>Create Event</button>
                                            </form>
                                        </div>
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
