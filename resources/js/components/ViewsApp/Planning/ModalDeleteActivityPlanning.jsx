import {PureComponent} from "react";
import DatePicker from "react-datepicker";
import React from "react";
import PropTypes from 'prop-types';

export default class ModalDeleteActivityPlanning extends PureComponent {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        handleNoneModal: PropTypes.func.isRequired,
        handleDelete: PropTypes.func.isRequired
    };

    render() {
        return (
            < div className="modal show fade in" id="modal_event" style={{
                display: 'block',
                paddingRight: '-17px'
            }}>
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
                            <h2 className="text-center mt-2">De you want to delete this activity ?!</h2>
                            <div className="block">
                                <div className="block-content">
                                    <div className='text-center'>
                                        <button className='btn btn-secondary' type='button' onClick={this.props.handleNoneModal}>Cancel</button>
                                        <button style={{marginLeft: '15px'}} className='btn btn-danger' type='button' onClick={this.props.handleDelete}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
