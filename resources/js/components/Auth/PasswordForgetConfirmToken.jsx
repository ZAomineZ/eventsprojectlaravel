import React, {PureComponent} from 'react';
import $ from "jquery";
import * as axios from "axios";
import {NotifGlobal} from "../LayoutApp";
import {Redirect} from "react-router";
import LayoutApp from "../LayoutApp";

export default class PasswordForgetConfirmToken extends PureComponent
{
    constructor(props)
    {
        super(props);
        this.state = {
            password: '',
            password_confirm: '',

            errors: {
                password: '',
                password_confirm: ''
            },

            onConfirm: false,
            onCancel: false,

            loading: false,
            redirectLogin: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this)
    }

    onConfirm() {
        this.setState({onConfirm: !this.state.onConfirm})
    }

    onCancel() {
        this.setState({onCancel: !this.state.onCancel})
    }

    onNewPasswordToken(password, passwordConfirm, authToken)
    {
        this.setState({loading: true});

        const params = {
            password: password,
            passwordConfirm: passwordConfirm,
            authToken: authToken
        };

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };
        axios.post('/api/tokenUserExist/' + authToken, {
            headers: headers,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                this.setState({loading: false});

                NotifGlobal('Well Done !!!', response.data.data.message, 'success', this.onConfirm(), this.onCancel());
                this.setState({redirectLogin: !this.state.redirectLogin})
            } else {
                this.setState({loading: false});
                NotifGlobal('Error Find !!!', response.data.data.message, 'danger', this.onConfirm(), this.onCancel());
            }
        })
    }

    onSubmit(e) {
        e.preventDefault();

        // Token Auth Params !!!
        const {authToken} = this.props.match.params;

        if (this.state.password.length !== 0 && this.state.password_confirm.length !== 0) {
            if (this.validForm(this.state.errors)) {
                if (this.state.password === this.state.password_confirm) {
                    return this.onNewPasswordToken(this.state.password, this.state.password_confirm, authToken);
                } else {
                    return NotifGlobal('Warning !!!', 'Your password field and your password_confirm must to be is equal !!!', 'danger')
                }
            }
        }
        return NotifGlobal('Warning !!!', 'Wrong information to be create your account !!!', 'danger')
    }

    validForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }

    handleChange(e) {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        switch (name) {
            case 'password' :
                errors.password =
                    value.length === 0 ? 'Password Confirm Field mustn\'t be empty' :
                        value.length < 5 ? 'Password Confirm Field must be 5 characters long !' : '';
                break;
            case 'password_confirm' :
                errors.password_confirm =
                    value.length === 0 ? 'Password Confirm Field mustn\'t be empty' :
                        value.length < 5 ? 'Password Confirm Field must be 5 characters long !' : '';
                break;
            default:
                break
        }

        this.setState({errors, [name]: value});
    }

    onAuthUserTokenExist(token)
    {
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };
        axios.get('/api/tokenUserExist/' + token, {
            header: header
        }).then((response) => {
            if (response.data.success !== true) {
                NotifGlobal('Error Found !!!', response.data.data.message, 'danger', this.onConfirm(), this.onCancel());
                this.setState({redirectLogin: !this.state.redirectLogin})
            }
        })
    }

    componentDidMount() {
        const {authToken} = this.props.match.params;

        let layoutApp = new LayoutApp();
        let PageResponse = layoutApp.PageForAuth();
        if (PageResponse.type && PageResponse.type === 'error') {
            return this.props.history.push('/home');
        } else {
            if (authToken && authToken !== '') {
                return this.onAuthUserTokenExist(authToken);
            }
        }
    }

    render() {
        const {errors, loading} = this.state;

        if (this.state.redirectLogin) {
            return (
                <Redirect to='/login' />
            )
        }

        return (
            <div id="page-container" className="main-content-boxed side-trans-enabled">
                <main id="main-container">
                    <div className="bg-image img-background-japan">
                        <div className="row mx-0 bg-black-op">
                            <div className="static col-md-6 col-xl-8 d-none d-md-flex align-item-flex">
                                <div className="py-30 animated fadeIn" data-toggle="appear">
                                    <p className="font-w600 font-size-h3 text-white">
                                        Get Inspired and Create.
                                    </p>
                                    <p className="text-italic text-white-op">
                                        <span className="">2017-18</span>
                                    </p>
                                </div>
                            </div>
                            <div
                                className="static col-md-6 col-xl-4 d-flex align-item-center bg-white animated fadeInRight"
                                data-toggle="appear" data-class="animated fadeInRight">
                                <div className="content content-full">
                                    <div className="px-30 py-30">
                                        <a href="" className="link-effect font-w700">
                                            <i className="fa fa-fire"></i>
                                            <span className="font-size-xl text-dual-primary-dark">Events</span>
                                            <span className="font-size-xl">Base</span>
                                        </a>
                                        <h1 className="h3 font-w700 mt-30 mb-10"> Don\'t worry, we\'ve got your
                                            back</h1>
                                        <h2 className="h5 font-w400 text-muted mb-0">Please enter your new password</h2>
                                    </div>
                                    <form id="validation" className="px-30" method="post" noValidate="novalidate" onSubmit={this.onSubmit}>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label htmlFor="password">New Password</label>
                                                    <input type="password" name="password"
                                                           className={errors.password.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                           formNoValidate onChange={this.handleChange}/>
                                                    {
                                                        errors.password.length > 0 &&
                                                        <div
                                                            className={errors.password.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                            {errors.password}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label htmlFor="password">Confirm New Password</label>
                                                    <input type="password" name="password_confirm"
                                                           className={errors.password_confirm.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                           formNoValidate onChange={this.handleChange}/>
                                                    {
                                                        errors.password_confirm.length > 0 &&
                                                        <div
                                                            className={errors.password_confirm.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                            {errors.password_confirm}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <button type="submit" className="btn btn-sm btn-hero btn-primary" disabled={loading}>
                                                {
                                                    loading ?
                                                        <div>
                                                            <span className="spinner-border spinner-border-sm mr-2"
                                                                  role="status"
                                                                  aria-hidden="true"></span>
                                                            Loading...
                                                        </div>
                                                        :
                                                        <div>
                                                            <i className="fa fa-asterisk mr-2"></i>
                                                            Update Password
                                                        </div>
                                                }
                                            </button>
                                            <div className="mt-30">
                                                <a className="effect link-effect text-muted mr-10 mb-5 inline-block"
                                                   href="/login">
                                                    <i className="fa fa-user mr-2"></i>
                                                    Sign In
                                                </a>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}
