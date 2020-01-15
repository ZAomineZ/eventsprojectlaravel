import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class NotificationLoad extends PureComponent
{
    constructor(props)
    {
        super(props);
        this.state = {
            notification: true
        };
        this.handleClick = this.handleClick.bind(this);
    }

    static propTypes = {
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    };

    handleClick()
    {
        this.setState({notification: !this.state.notification});
    }

    render() {
        return (
            <div className='notif-start'>
                <div className={this.state.notification ? 'toast fade show' : 'toast fade hide'}>
                    <div className="toast-header">
                        {
                            this.props.type === 'success'
                                ? <i className="fa fa-thumbs-up text-primary mr-2"></i>
                                : <i className="fa fa-exclamation-triangle text-danger mr-2"></i>
                        }
                        <strong className="mr-auto">{ this.props.title }</strong>
                        <small className="text-muted">just now</small>
                        <button type="button" className="ml-2 close" onClick={this.handleClick}>
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="toast-body">
                        { this.props.message }
                    </div>
                </div>
            </div>
        )
    }
}
