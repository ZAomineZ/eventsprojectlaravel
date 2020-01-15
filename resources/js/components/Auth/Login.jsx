import React, {PureComponent} from 'react'
import {Link, Redirect} from "react-router-dom";
import * as axios from "axios";
import $ from 'jquery';
import LayoutApp, {NotifGlobal} from '../LayoutApp';
import Cookie from "react-cookies";

export default class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            rememberMe: false,

            onCancel: false,
            onConfirm: false,

            errors: {
                email: '',
                password: '',
            },

            loading: false,

            redirectHomePage: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        let layoutApp = new LayoutApp();
        let PageResponse = layoutApp.PageForAuth();
        if (PageResponse.type && PageResponse.type === 'error') {
            this.setState({redirectHomePage: !this.state.redirectHomePage});
        }
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

    /**
     *
     * @param email
     * @param password
     * @private
     */
    loginUser(email, password, rememberMe) {
        this.setState({loading: true});

        const params = {
            email: email,
            password: password,
            rememberMe: rememberMe
        };

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        axios.post('/api/login', {
            headers: headers,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                const dataUser = response.data.data;

                let AuthData = {
                    id: dataUser.id,
                    name: dataUser.name,
                    email: dataUser.email,
                    auth_token: dataUser.auth_token
                };

                let appState = {
                    isLoggedIn: true,
                    user: AuthData
                };

                localStorage['appState'] = JSON.stringify(appState);

                this.cookieRememberMe(dataUser);
                this.setState({loading: false});

                NotifGlobal('Well Done !!!', 'You are logged with success !!!', 'success', this.onConfirm(), this.onCancel());
                this.setState({redirectHomePage: !this.state.redirectHomePage});
            } else {
                this.setState({loading: false});

                NotifGlobal('Error Login !!!', 'A error has found, ' + response.data.message, 'danger', this.onConfirm(), this.onCancel());
            }
        }).catch((error) => {
            NotifGlobal('Error Occured !!!', error, 'danger', this.onConfirm(), this.onCancel());
        });
    };

    cookieRememberMe(dataUser) {
        if (dataUser && dataUser.remember_me.length !== 0) {
            Cookie.save('authCookie', dataUser.remember_me, {
                maxAge: 2592000
            })
        }
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.email.length !== 0 && this.state.password.length !== 0) {
            if (this.validForm(this.state.errors)) {
                return this.loginUser(this.state.email, this.state.password, this.state.rememberMe);
            }
        } else {
            return NotifGlobal('Error Login !!!', 'Wrong information to be create your account !!!', 'danger')
        }
    }

    handleChange(e) {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        const validEmailRegex =
            RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        switch (name) {
            case 'email' :
                errors.email = value.length === 0 ? 'Email Field mustn\'t be empty' :
                    !validEmailRegex.test(value) ? 'Email is not valid !' : '';
                break;
            case 'password' :
                errors.password =
                    value.length === 0 ? 'Password Field mustn\'t be empty' :
                        value.length < 5 ? 'Password must be 5 characters long !' : '';
                break;
            default:
                break
        }

        this.setState({errors, [name]: value});
    }

    handleClick() {
        this.setState({rememberMe: !this.state.rememberMe});
    }

    render() {
        const {errors, loading} = this.state;

        if (this.state.redirectHomePage) {
            return (
                <Redirect to='/home'/>
            )
        }

        return (
            <div id="page-container" className="main-content-boxed side-trans-enabled">
                <main id="main-container" className='height-body'>
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
                                    <div className="px-30 py-10">
                                        <a href="" className="link-effect font-w700">
                                            <i className="fa fa-fire"></i>
                                            <span className="font-size-xl text-dual-primary-dark">Events</span>
                                            <span className="font-size-xl">Base</span>
                                        </a>
                                        <h1 className="h3 font-w700 mt-30 mb-10">Welcome to Your Dashboard</h1>
                                        <h2 className="h5 font-w400 text-muted mb-0">Please sign in</h2>
                                    </div>
                                    <form id="validation" className="px-30" method="POST" noValidate="novalidate"
                                          onSubmit={this.onSubmit}>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <label htmlFor="email">Email</label>
                                                <input type="email" name="email"
                                                       className={errors.email.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                       formNoValidate onChange={this.handleChange}/>
                                                {
                                                    errors.email.length > 0 &&
                                                    <div
                                                        className={errors.email.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                        {errors.email}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <label htmlFor="password">Password</label>
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
                                            <div className="form-group form-check custom-checkbox">
                                                <input type="checkbox" className="form-check-input" id="rememberMe"
                                                       onChange={this.handleClick}/>
                                                <label className="form-check-label" htmlFor="rememberMe">Remember
                                                    me</label>
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
                                                            <i className="fa fa-sign-in mr-10"></i>
                                                            Sign In
                                                        </div>
                                                }
                                            </button>
                                            <div className="mt-30">
                                                <Link to='/register'
                                                      className="effect link-effect text-muted mr-10 mb-5 inline-block">
                                                    <i className="fa fa-plus mr-2"></i>
                                                    Create Account
                                                </Link>
                                                <Link className="effect link-effect text-muted mr-10 mb-5 inline-block"
                                                      to="/forget_password">
                                                    <i className="fa fa-warning mr-2"></i>
                                                    Forgot Password
                                                </Link>
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
