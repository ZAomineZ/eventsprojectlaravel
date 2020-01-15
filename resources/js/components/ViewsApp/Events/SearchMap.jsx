import React, {PureComponent} from 'react';
import DeckGL, { PointCloudLayer } from "deck.gl";
import {NotifAppMessage, TOKEN_MAP_REACT} from '../../LayoutApp';
import ReactMapGL from 'react-map-gl';
import "mapbox-gl/dist/mapbox-gl.css"
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import $ from "jquery";
import * as axios from 'axios';

const geolocateStyle = {
    float: 'left',
    margin: '50px',
    padding: '10px'
};

export default class SearchMap extends PureComponent
{
    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                latitude: 0,
                longitude: 0,
                zoom: 1
            },

            searchResultCity: null
        };
        this.handleOnResult = this.handleOnResult.bind(this);
        this.handleChangeViewport = this.handleChangeViewport.bind(this);
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem('appState'));
        const slug = this.props.match.params.slug;

        if (!slug || slug.length === 0) {
            this.props.history.push('/home');
            NotifAppMessage('danger', 'You can\'t accessed to this page !!!', 'Warning !!!')
        }

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/map/event/' + slug, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    // Code :

                    // Update State Viewport to the map !!!
                    let viewport = JSON.parse(response.data.data.position.viewport);

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
                        viewport: { ...this.state.viewport, ...newViewport }
                    });
                } else {
                    this.props.history.push('/home');
                    NotifAppMessage('danger', response.data.message, 'Warning !!!');
                }
            })

        } else {
            NotifAppMessage('danger', 'You must to be connected for accessed to this page !!!')
        }
    }

    myMap = React.createRef();

    handleOnResult (event)
    {
        this.setState({
            searchResultCity: new GeoJsonLayer({
                id: "search-result",
                data: event.result.geometry,
                getFillColor: [255, 0, 0, 128],
                getRadius: 1000,
                pointRadiusMinPixels: 10,
                pointRadiusMaxPixels: 10
            })
        })
    };

    handleChangeViewport (viewport)
    {
        this.setState({
            viewport: { ...this.state.viewport, ...viewport }
        })
    };

    render() {
        const {viewport, searchResultCity} = this.state;

        return (
            <div style={{ height: '100vh'}}>
                <ReactMapGL
                    ref={this.myMap}
                    {...viewport}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                    width="100%"
                    height="100%"
                    onViewportChange={this.handleChangeViewport}
                    mapboxApiAccessToken={TOKEN_MAP_REACT}
                >
                </ReactMapGL>
                <DeckGL {...viewport} layers={[searchResultCity]} />
            </div>
        )
    }

}
