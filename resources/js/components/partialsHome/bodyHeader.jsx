import React, {PureComponent} from 'react'

// IMAGE IMPORT
import eventImg from '@img/event.png';
import eventImg_2 from '@img/event2.png';
import eventImg_3 from '@img/event3.png';
import eventImg_4 from '@img/event4.png';

import friend from '@img/friend.png';
import calendar from '@img/calendar.png';
import notif from '@img/notif.png';

export default class BodyHeader extends PureComponent
{
    render() {
        return (
            <div id="bodyHome">
                <div className="bg-white">
                    <div className="content content-full">
                        <div className="pt-100 pb-50">
                            <h3 className="h1 font-w700 text-center mb-10">
                                Unlimited
                                <span className="text-blue">Events</span>
                            </h3>
                            <h4 className="h3 font-w400 text-muted text-center mb-30px">Let your imagination build your idea
                                with the help of Codebase.</h4>
                            <hr/>
                                <div className="row nice-text my-10">
                                    <div className="col-md-6 py-20">
                                        <a href="" className="option-container push">
                                            <img alt="" className="img-fluid option-item" src={eventImg} />
                                                <div className="option-overlay bg-white-90">
                                                    <div className="option-overlay-ct h5 font-w700 text-uppercase">
                                                        <i className="fa fa-link"></i>
                                                    </div>
                                                </div>
                                        </a>
                                        <h4 className="font-size-xl font-w700 mb-10">
                                            <span className="text-uppercase">Info</span>
                                            <span className="text-blue">Events</span>
                                        </h4>
                                        <p>A classic and well tested approach for a project which is going to handle much data
                                            and needs all the space it can get.</p>
                                    </div>
                                    <div className="col-md-6 py-20">
                                        <a href="" className="option-container push">
                                            <img alt="" className="img-fluid option-item" src={eventImg_3}/>
                                                <div className="option-overlay bg-white-90">
                                                    <div className="option-overlay-ct h5 font-w700 text-uppercase">
                                                        <i className="fa fa-link"></i>
                                                    </div>
                                                </div>
                                        </a>
                                        <h4 className="font-size-xl font-w700 mb-10">
                                            <span className="text-uppercase">Comments</span>
                                            <span className="text-blue">Events</span>
                                        </h4>
                                        <p>A classic and well tested approach for a project which is going to handle much data
                                            and needs all the space it can get.</p>
                                    </div>
                                    <div className="col-md-6 py-20">
                                        <a href="" className="option-container push">
                                            <img alt="" className="img-fluid option-item" src={eventImg_2}/>
                                                <div className="option-overlay bg-white-90">
                                                    <div className="option-overlay-ct h5 font-w700 text-uppercase">
                                                        <i className="fa fa-link"></i>
                                                    </div>
                                                </div>
                                        </a>
                                        <h4 className="font-size-xl font-w700 mb-10">
                                            <span className="text-uppercase">Invite Friends In</span>
                                            <span className="text-blue">Events</span>
                                        </h4>
                                        <p>A classic and well tested approach for a project which is going to handle much data
                                            and needs all the space it can get.</p>
                                    </div>
                                    <div className="col-md-6 py-20">
                                        <a href="" className="option-container push">
                                            <img alt="" className="img-fluid option-item" src={eventImg_4} />
                                                <div className="option-overlay bg-white-90">
                                                    <div className="option-overlay-ct h5 font-w700 text-uppercase">
                                                        <i className="fa fa-link"></i>
                                                    </div>
                                                </div>
                                        </a>
                                        <h4 className="font-size-xl font-w700 mb-10">
                                            <span className="text-uppercase">Calendar</span>
                                            <span className="text-blue">Events</span>
                                        </h4>
                                        <p>A classic and well tested approach for a project which is going to handle much data
                                            and needs all the space it can get.</p>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
                <div className="" id="color-white">
                    <div className="content content-full">
                        <div className="pt-100 pb-50">
                            <h3 className="h1 font-w700 text-center mb-10">
                                Activity
                                <span className="text-blue">Events</span>
                            </h3>
                            <h4 className="h3 font-w400 text-muted text-center mb-30px">We built Codebase based on your valuable
                                feedback.</h4>
                            <hr/>
                                <div className="row nice-text my-10">
                                    <div className="col-md-4 py-20">
                                        <h4 className="font-size-xl font-w700 text-uppercase mb-10">
                                            <i className="fa fa-users text-blue mr-5"></i>
                                            Friends
                                        </h4>
                                        <p className="mb-0">We get to know you better by continuously listening to your
                                            feedback. This way, we learn where to focus our efforts and build/improve quality
                                            products to better match your needs.</p>
                                    </div>
                                    <div className="col-md-4 py-20">
                                        <h4 className="font-size-xl font-w700 text-uppercase mb-10">
                                            <i className="fa fa-calendar text-muted mr-5"></i>
                                            Calendar
                                        </h4>
                                        <p className="mb-0">We get to know you better by continuously listening to your
                                            feedback. This way, we learn where to focus our efforts and build/improve quality
                                            products to better match your needs.</p>
                                    </div>
                                    <div className="col-md-4 py-20">
                                        <h4 className="font-size-xl font-w700 text-uppercase mb-10">
                                            <i className="fa fa-bell text-danger mr-5"></i>
                                            Notifs
                                        </h4>
                                        <p className="mb-0">We get to know you better by continuously listening to your
                                            feedback. This way, we learn where to focus our efforts and build/improve quality
                                            products to better match your needs.</p>
                                    </div>
                                </div>
                        </div>
                        <div className="row pull-b text-center overflow-h no-gutters">
                            <div className="col-4 animated fadeInUp">
                                <img src={friend} alt="" className="img-fluid"/>
                            </div>
                            <div className="col-4 animated fadeInUp">
                                <img src={calendar} alt="" className="img-fluid"/>
                            </div>
                            <div className="col-4 animated fadeInUp">
                                <img src={notif} alt="" className="img-fluid"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white">
                    <div className="content content-full text-center overflow-h">
                        <div className="py-100">
                            <h3 className="font-w700 mb-10">
                                Crafted with
                                <i className="fa fa-heart text-danger"></i>
                            </h3>
                            <h4 className="font-w400 text-muted mb-30px">Passionate web design and development with over 10.000
                                customers worldwide.</h4>
                            <a href="#"
                               className="btn btn-hero btn-noborder btn-success mb-10 animated zoom-in">
                                <i className="fa fa-user"></i>
                                Log In
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
