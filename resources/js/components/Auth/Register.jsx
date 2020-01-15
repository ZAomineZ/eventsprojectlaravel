import React, {PureComponent} from 'react'
import {Link} from "react-router-dom";
import * as axios from "axios";
import $ from 'jquery';
import LayoutApp, {NotifGlobal} from '../LayoutApp';

export default class Register extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
            password_confirm: '',

            errors: {
                name: '',
                email: '',
                password: '',
                password_confirm: '',
            },

            loading: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        let layoutApp = new LayoutApp();
        let PageResponse = layoutApp.PageForAuth();
        if (PageResponse.type && PageResponse.type === 'error') {
            this.props.history.push('/home');
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
     * @param name
     * @param email
     * @param password
     * @private
     */
    registerUser(name, email, password) {
        this.setState({loading: true});

        const params = {
            name: name,
            email: email,
            password: password,
        };

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };

        axios.post('/api/register', {
            headers: headers,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                this.setState({loading: false});

                NotifGlobal('Well Done !!!', 'You are created your account with success !!!', 'success', this.onConfirm(), this.onCancel());
                this.props.history.push('/login');
            } else {
                this.setState({loading: false});

                NotifGlobal('Error Registration !!!', 'A error has found,' + response.data.message, 'danger', this.onConfirm(), this.onCancel());
            }
        }).catch((error) => {
            NotifGlobal('Error Occured !!!', error, 'danger', this.onConfirm(), this.onCancel());
        })
    };

    onSubmit(e) {
        e.preventDefault();
        if (this.state.name.length !== 0 && this.state.email.length !== 0 && this.state.password.length !== 0 && this.state.password_confirm.length !== 0) {
            if (this.validForm(this.state.errors)) {
                if (this.state.password === this.state.password_confirm) {
                    return this.registerUser(this.state.name, this.state.email, this.state.password);
                } else {
                    return NotifGlobal('Warning !!!', 'Your password field and your password_confirm must to be is equal !!!', 'danger')
                }
            }
        }
        return NotifGlobal('Warning !!!', 'Wrong information to be create your account !!!', 'danger')
    }

    handleChange(e) {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        const validEmailRegex =
            RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        switch (name) {
            case 'name' :
                errors.name = value.length === 0 ? 'Username Field mustn\'t be empty' :
                    value.length < 3 ? 'Username must be 3 characters long !' : '';
                break;
            case 'email' :
                errors.email = value.length === 0 ? 'Email Field mustn\'t be empty' :
                    !validEmailRegex.test(value) ? 'Email is not valid !' : '';
                break;
            case 'password' :
                errors.password =
                    value.length === 0 ? 'Password Field mustn\'t be empty' :
                        value.length < 5 ? 'Password must be 5 characters long !' : '';
                break;
            case 'password_confirm' :
                errors.password_confirm = value.length === 0 ? 'Password Field mustn\'t be empty' : '';
                break;
            default:
                break
        }

        this.setState({errors, [name]: value});
    }

    render() {
        const {errors, loading} = this.state;

        return (
            <div id="page-container" className="main-content-boxed side-trans-enabled">
                <main id="main-container" className='height-body'>
                    <div className="bg-image img-background-japan">
                        <div className="row mx-0 bg-black-op">
                            <div className="static col-md-6 col-xl-8 d-none d-md-flex align-item-flex">
                                <div className="py-30 animated fadeIn" data-toggle="appear">
                                    <p className="font-w600 font-size-h3 text-white">
                                        We're very happy you are joining our community!
                                    </p>
                                    <p className="font-size-h5 text-white">
                                        <i className="fa fa-angles-right"></i> Create your account today and receive 50%
                                        off.
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
                                        <a href="/" className="link-effect font-w700">
                                            <i className="fa fa-fire"></i>
                                            <span className="font-size-xl text-dual-primary-dark">Events</span>
                                            <span className="font-size-xl">Base</span>
                                        </a>
                                        <h1 className="h3 font-w700 mt-30 mb-10">Create New Account</h1>
                                        <h2 className="h5 font-w400 text-muted mb-0">Please add your details</h2>
                                    </div>
                                    <form
                                        className='needs-validation mb-10 px-30'
                                        method="post" id="register" noValidate onSubmit={this.onSubmit}>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <div className="form-material float">
                                                    <input type="text" name="name"
                                                           className={errors.name.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                           formNoValidate onChange={this.handleChange}/>
                                                    <label htmlFor="name">Username</label>
                                                    {
                                                        errors.name.length > 0 &&
                                                        <div
                                                            className={errors.name.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                            {errors.name}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <div className="form-material float">
                                                    <input type="email" name="email"
                                                           className={errors.email.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                           formNoValidate onChange={this.handleChange}/>
                                                    <label htmlFor="email">Email</label>
                                                    {
                                                        errors.email.length > 0 &&
                                                        <div
                                                            className={errors.email.length > 0 ? 'invalid-feedback invalid-block' : 'invalid-feedback'}>
                                                            {errors.email}
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-12">
                                                <div className="form-material float">
                                                    <input type="password" name="password"
                                                           className={errors.password.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                           formNoValidate onChange={this.handleChange}/>
                                                    <label htmlFor="password">Password</label>
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
                                                <div className="form-material float">
                                                    <input type="password" name="password_confirm"
                                                           className={errors.password_confirm.length > 0 ? 'form-control is-invalid' : 'form-control'}
                                                           formNoValidate onChange={this.handleChange}/>
                                                    <label htmlFor="password_confirm">Password Confirm</label>
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
                                            <button type="submit" className="btn btn-sm btn-hero btn-primary"
                                                    disabled={loading}>
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
                                                            Create Account
                                                        </div>
                                                }
                                            </button>
                                            <div className="mt-30">
                                                <Link to='/login'
                                                      className="effect link-effect text-muted mr-10 mb-5 inline-block">
                                                    <i className="fa fa-user mr-2"></i>
                                                    Sign In
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
