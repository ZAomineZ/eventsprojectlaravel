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
import {isInteger, isString} from "lodash";
import $ from "jquery";
import * as axios from "axios";

export default class ModalUpdateEvent extends PureComponent
{
    constructor(props) {
        super(props);
        this.state = {
            images: []
        };
        this.handleImagesDelete = this.handleImagesDelete.bind(this);
        this.handleRemoveImage = this.handleRemoveImage.bind(this)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps) {
            if (nextProps.imagesEvent) {
                this.setState({images: nextProps.imagesEvent})
            }
        }
    }

    static propTypes = {
        activeModalUpdateEvent: PropTypes.bool.isRequired,
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

        // Props Default Value Input Form to Event !!!
        date: PropTypes.object.isRequired,
        titleEvent: PropTypes.string.isRequired,
        slugEvent: PropTypes.string.isRequired,
        placeEvent: PropTypes.string.isRequired,
        userMaxEvent: PropTypes.number.isRequired,
        categoryIdEvent: PropTypes.number.isRequired,
        typeEvent: PropTypes.string.isRequired,
        contentEvent: PropTypes.string.isRequired,
        imagesEvent: PropTypes.array.isRequired
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
            formData.append('slugEvent', this.props.slugEvent);

            axios.post('/api/event/create/picture/delete', formData, {
                headers: headers
            }).then(response => {
                if (response.data.success && response.data.success === false) {
                    NotifAppMessage('danger', response.data.message, 'Warning !!!')
                }
            })
        }
    }

    handleImagesDelete(event)
    {
        event.preventDefault();
        let ImageId = event.target.getAttribute('data-id');
        if (isInteger(ImageId) || isString(ImageId) && ImageId !== 0) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'multipart/form-data, application/json',
                "Accept": "multipart/form-data, application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                user: localStorage.getItem('appState')
            };

            axios.post('/api/image/delete/' + ImageId, {
                headers: headers,
                params: params
            }).then((response => {
                if (response.data.success === true) {
                    this.setState({images: response.data.data.images});
                    NotifAppMessage('success', response.data.data.message, 'Well Done !!!');
                } else {
                    NotifAppMessage('danger', 'This Image isn\'t exist or your don\'t belong to you !!!', 'Error Found !!!');
                }
            }))
        }
    }

    render() {
        const {titleEvent, placeEvent, userMaxEvent, categoryIdEvent, typeEvent, contentEvent} = this.props;
        const {images} = this.state;
        const user = JSON.parse(localStorage.getItem('appState'));

        return (
            <div className="modal show fade in" id="modal_event" style={this.props.activeModalUpdateEvent ? {
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
                            <h2 className="text-center mt-2">Update a event</h2>
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
                                                               value={titleEvent}
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
                                                                    inputValue={placeEvent}
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
                                                                        <option value={d.id} selected={d.id === categoryIdEvent}>
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
                                                            <option value="2" selected={userMaxEvent === 2}>2</option>
                                                            <option value="4" selected={userMaxEvent === 4}>4</option>
                                                            <option value="6" selected={userMaxEvent === 6}>6</option>
                                                            <option value="8" selected={userMaxEvent === 8}>8</option>
                                                            <option value="12" selected={userMaxEvent === 12}>12</option>
                                                            <option value="16" selected={userMaxEvent === 16}>16</option>
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
                                                            <option value="public" selected={typeEvent === 'public'}>Publique</option>
                                                            <option value="private" selected={typeEvent === 'private'}>Privée</option>
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
                                                                  value={contentEvent}
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
                                                            <div className="row items-push">
                                                                {
                                                                    images.length > 0 ?
                                                                        images.map(d => {
                                                                            return (
                                                                                <div className="col-md-4 animated fadeIn">
                                                                                    <div
                                                                                        className="option-container zoom-out zoom-in">
                                                                                        <img alt=''
                                                                                             className="img-fluid option-item"
                                                                                             src={d.img_medium}/>
                                                                                        <div className="option-overlay bg-black-op">
                                                                                            <div className="option-overlay-ct">
                                                                                                <a href="#" name="delete"
                                                                                                   onClick={this.handleImagesDelete}
                                                                                                   data-id={d.id}
                                                                                                   className="item item-circle mx-auto mb-15 text-danger bg-gray-lighter">
                                                                                                    <i className="fa fa-trash mt-15"></i>
                                                                                                </a>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                        : <h5 className='pl-3'>Aucunes Images trouvées</h5>
                                                                }
                                                            </div>
                                                            <Upload listType='picture'
                                                                    action={user && '/api/event/updated/' + this.props.slugEvent + '/' + user.user.id}
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
