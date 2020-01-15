import React, {PureComponent} from 'react';
import {Button, Icon, Upload} from "antd";
import PropTypes from 'prop-types';

// Token Api Map Event !!
import {NotifAppMessage, TOKEN_MAP_REACT} from "../../LayoutApp";

import ReactMapGL from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";
import DeckGL from "deck.gl";

// CSS Component
import "react-datepicker/dist/react-datepicker.css";
import "react-dropzone-uploader/dist/styles.css";
import DatePicker from "react-datepicker";
import $ from "jquery";
import * as axios from "axios";

export default class ModalCreateEvent extends PureComponent
{
    constructor(props) {
        super(props);

        this.handleRemoveImage = this.handleRemoveImage.bind(this)
    }

    static propTypes = {
        activeModalCreateEvent: PropTypes.bool.isRequired,
        handleNoneModal: PropTypes.func.isRequired,
        handleOnResultPlace: PropTypes.func.isRequired,
        handleChangeViewport: PropTypes.func.isRequired,
        handleChangeDate: PropTypes.func.isRequired,
        handleChange: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        categories: PropTypes.array.isRequired,
        viewport: PropTypes.object.isRequired,
        myMap: PropTypes.func.isRequired,
        searchResultCity: PropTypes.object.isRequired,
        date: PropTypes.object.isRequired
    };

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

    render() {
        const user = JSON.parse(localStorage.getItem('appState'));

       return (
            <div className="modal show fade in" id="modal_event" style={this.props.activeModalCreateEvent ? {
                display: 'block',
                paddingRight: '-17px'
            } : {display: 'none'}}>
                <div className="modal-element">
                    <div className="modal-content">
                        <div className="block-option">
                            <button className="btn-block-option" type="button"
                                    data-dismiss="modal"
                                    onClick={this.props.handleNoneModal}>
                                <i className="fa fa-close"></i>
                            </button>
                        </div>
                        <div className="content">
                            <h2 className="text-center mt-2">Créer un event</h2>
                            <div className="block">
                                <div className="block-content">
                                    <form action="#" className="" method="post" onSubmit={this.props.handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="title">Your Title</label>
                                                        <input type="text" id="title" name="title"
                                                               onChange={this.props.handleChange}
                                                               className='form-control form-control-lg'
                                                               placeholder="Enter your title.."/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="">Place</label>
                                                        <div style={{margin: '0 auto'}}>
                                                            <ReactMapGL
                                                                ref={this.props.myMap}
                                                                {...this.props.viewport}
                                                                mapStyle="mapbox://styles/mapbox/streets-v9"
                                                                width="100%"
                                                                height="500px"
                                                                mapboxApiAccessToken={TOKEN_MAP_REACT}
                                                            >
                                                                <Geocoder
                                                                    mapRef={this.props.myMap}
                                                                    onResult={this.props.handleOnResultPlace}
                                                                    onViewportChange={this.props.handleChangeViewport}
                                                                    mapboxApiAccessToken={TOKEN_MAP_REACT}
                                                                />
                                                                <DeckGL {...this.props.viewport}
                                                                        layers={[this.props.searchResultCity]}
                                                                        style={{position: 'relative'}}/>
                                                            </ReactMapGL>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="category_id">Category</label>
                                                        <select className="form-control" name="category_id"
                                                                onChange={this.props.handleChange}
                                                                id="category_id">
                                                            {
                                                                this.props.categories.map(d => {
                                                                    return (
                                                                        <option value={d.id}>
                                                                            {d.name}
                                                                        </option>
                                                                    )
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="user_max">Users max</label>
                                                        <select className="form-control"
                                                                onChange={this.props.handleChange}
                                                                name="user_max" id="users_max">
                                                            <option value="2">2</option>
                                                            <option value="4">4</option>
                                                            <option value="6">6</option>
                                                            <option value="8">8</option>
                                                            <option value="12">12</option>
                                                            <option value="16">16</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="type_event">Type</label>
                                                        <select className="form-control"
                                                                onChange={this.props.handleChange}
                                                                id='type_event' name="type_event">
                                                            <option value="public">Publique</option>
                                                            <option value="private">Privée</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="date">Date and Hours</label>
                                                        <DatePicker
                                                            selected={this.props.date}
                                                            onChange={this.props.handleChangeDate}
                                                            showTimeSelect
                                                            timeFormat='HH:mm'
                                                            className='form-control'
                                                            timeIntervals={15}
                                                            timeCaption="time"
                                                            dateFormat='MMMM d, yyyy h:mm aa'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="content">Description</label>
                                                        <textarea name="content" id='content'
                                                                  onChange={this.props.handleChange}
                                                                  className='form-control'
                                                                  rows='8' placeholder='Your content...'/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="">Images</label>
                                                        <div className="">
                                                            <Upload listType='picture'
                                                                    action={user && '/api/event/created/' + user.user.id}
                                                                    onRemove={this.handleRemoveImage}
                                                                    className='upload-list-inline' name='file'>
                                                                <Button>
                                                                    <Icon type="upload"/> Upload
                                                                </Button>
                                                            </Upload>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <button className="btn btn-primary" type="submit" name="create_all">
                                                    <i className="fa fa-check mr-2"></i>
                                                    Complete event
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
        );
    }
}
