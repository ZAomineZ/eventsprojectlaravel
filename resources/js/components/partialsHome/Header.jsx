import React, {PureComponent} from 'react'
import BodyHeader from './bodyHeader'
import {Link} from "react-router-dom";

export default class Header extends PureComponent
{
    render() {
        return (
            <div id="page-container" className="main-content-boxed side-trans">
                <main id="main-container" className='height-body'>
                    <div className="bg-image img-background">
                        <div className="bg-white-90">
                            <div className="content content-full text-center">
                                <div className="pt-100 pb-50">
                                    <h1 className="font-w700">
                                        <i className="fa fa-first-order font-size-h3 text-blue"></i>
                                        EventsBase
                                    </h1>
                                    <h2 className="h3 font-w400 text-muted mb-50">Next generation multipurpose UI framework.</h2>
                                    <Link to='/login' className="btn btn-hero btn-noborder btn-success min-width-175 mb-10 mx-5">
                                        <i className="fa fa-briefcase mr-2"></i>
                                        Log In
                                    </Link>
                                    <Link to='/register' className="btn btn-hero btn-noborder btn-primary min-width-175 mb-10 mx-5">
                                            <i className="fa fa-rocket mr-2"></i>
                                            Register
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <BodyHeader />
                </main>
            </div>
        )
    }
}
