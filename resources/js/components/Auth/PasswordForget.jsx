import React, {PureComponent} from 'react'
import * as axios from "axios";
import $ from "jquery";
import {NotifGlobal} from "../LayoutApp";
import LayoutApp from "../LayoutApp";
import {Link} from "react-router-dom";

export default class PasswordForget extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            email: '',

            errors: {
                email: ''
            },

            loading: false,

            onConfirm: false,
            onCancel: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    onConfirm() {
        this.setState({onConfirm: !this.state.onConfirm})
    }

    onCancel() {
        this.setState({onCancel: !this.state.onCancel})
    }

    validForm(errors) {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    }

    componentDidMount() {
        let layoutApp = new LayoutApp();
        let PageResponse = layoutApp.PageForAuth();
        if (PageResponse.type && PageResponse.type === 'error') {
            return this.props.history.push('/home');
        }
    }

    passwordForget(email) {
        this.setState({loading: true});

        let header = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        };
        let params = {
            email: email
        };
        axios.post('/api/password-forget', {
            header: header,
            params: params
        }).then((response) => {
            if (response.data.success === true) {
                this.setState({loading: false});
                NotifGlobal('Well Done !!!', response.data.data.message, 'success', this.onConfirm(), this.onCancel());
            } else {
                this.setState({loading: false});
                NotifGlobal('Error Find !!!', response.data.data.message, 'danger', this.onConfirm(), this.onCancel());
            }
        })
    }

    onSubmit(e) {
        e.preventDefault();
        if (this.state.email.length !== 0) {
            if (this.validForm(this.state.errors)) {
                return this.passwordForget(this.state.email);
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
            case 'email' :
                errors.email = value.length === 0 ? 'Email Field mustn\'t be empty' :
                    !validEmailRegex.test(value) ? 'Email is not valid !' : '';
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
                                        <h1 className="h3 font-w700 mt-30 mb-10"> Don't worry, we've got your back</h1>
                                        <h2 className="h5 font-w400 text-muted mb-0">Please enter your username or
                                            email</h2>
                                    </div>
                                    <form id="validation" className="px-30" method="post" noValidate="novalidate"
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
                                                            <i className="fa fa-asterisk mr-10"></i>
                                                            Password Reminder
                                                        </div>
                                                }
                                            </button>
                                            <div className="mt-30">
                                                <Link className="effect link-effect text-muted mr-10 mb-5 inline-block"
                                                   to="/login">
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
