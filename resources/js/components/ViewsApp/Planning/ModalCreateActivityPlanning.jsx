import React, {PureComponent} from 'react'
import DatePicker from "react-datepicker";
import PropTypes from 'prop-types'

export default class ModalCreateActivityPlanning extends PureComponent
{
    constructor(props)
    {
        super(props);
    }

    static propTypes = {
        handleNoneModal: PropTypes.func.isRequired,
        handleChange: PropTypes.func.isRequired,
        handleChangeDate: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        hours: PropTypes.object.isRequired
    };

    render() {
        return (
            <div className="modal show fade in" id="modal_event" style={ {
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
                            <h2 className="text-center mt-2">Add a Activity</h2>
                            <div className="block">
                                <div className="block-content">
                                    <form action="#" className="" method="post" onSubmit={this.props.handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="title">Your Activity</label>
                                                        <input type="text" id="activity" name="activity"
                                                               onChange={this.props.handleChange}
                                                               className='form-control form-control-lg'
                                                               placeholder="Enter your activity.."/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group row">
                                                    <div className="col-12">
                                                        <label htmlFor="date">Hours</label>
                                                        <DatePicker
                                                            selected={this.props.hours}
                                                            onChange={this.props.handleChangeDate}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeFormat='h:mm aa'
                                                            className='form-control'
                                                            timeIntervals={15}
                                                            timeCaption="time"
                                                            dateFormat='h:mm aa'
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <button className="btn btn-primary" type="submit" name="create_all">
                                                    <i className="fa fa-check mr-2"></i>
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
        )
    }
}
