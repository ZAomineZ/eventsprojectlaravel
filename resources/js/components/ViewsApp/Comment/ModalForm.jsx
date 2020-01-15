import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class ModalForm extends PureComponent {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        commentID: PropTypes.string.isRequired,
        activeModal: PropTypes.bool.isRequired,
        commentValue: PropTypes.string.isRequired,
        handleClose: PropTypes.func,
        handleSubmit: PropTypes.func,
        handleChange: PropTypes.func
    };

    render() {
        return (
            <div id={'modal-comment'}>
                <div
                    className={this.props.activeModal ? 'modal fade show d-block' : 'modal fade in d-none'}>
                    <div className="modal-element">
                        <div className="modal-content">
                            <div className="block-option">
                                <button className="btn-block-option" type="button" onClick={this.props.handleClose}>
                                    <i className="fa fa-close"></i>
                                </button>
                            </div>
                            <div className="content">
                                <h2 className="text-center mt-2">Update your comment</h2>
                                <div className="block block-transparent">
                                    <div className="block-content">
                                        <form action="" className="" method="post" onSubmit={this.props.handleSubmit}>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="form-group row">
                                                        <div className="col-12">
                                                            <label htmlFor="comment">Your Comment</label>
                                                            <input type="text" id="comment" name="comment"
                                                                   onChange={this.props.handleChange}
                                                                   className="form-control form-control-lg"
                                                                   value={this.props.commentValue}
                                                                   placeholder="Enter your comment.."/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <div className="col-12">
                                                    <button className="btn btn-primary" type="submit">
                                                        <i className="fa fa-check mr-2"></i>
                                                        Complete comment
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
                <div className={this.props.activeModal ? 'modal-backdrop fade show' : ''}></div>
            </div>
        )
    }
}
