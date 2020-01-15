import React, {PureComponent} from "react";
import HeaderHome from "../HeaderHome";
import $ from "jquery";
import * as axios from "axios";
import {Link} from "react-router-dom";

export default class MeJoinEvents extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            eventsJoin: []
        }
    }

    componentDidMount() {
        let user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            axios.get('/api/me_join_events/' + user.user.id, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({eventsJoin: response.data.data.eventsJoin})
                }
            })
        }
    }

    render() {
        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content">
                        {
                            this.state.eventsJoin.length === 0 &&
                            <div className="msg_help">
                                <div className="msg_info">
                                    Vous n'avez pas toujours pas rejoind d'event ? Aucun problème, cliquez <Link
                                    to={'/event/search'}>ici</Link> pour en rechercher
                                </div>
                            </div>
                        }
                        <h2 className="content-heading">Your Events joins</h2>
                        <div className="block">
                            <div className="block-content block-content-full tab-content overflow-h">
                                <div className="">
                                    <div className="font-size-h3 font-w600 py-30 mb-20px text-center border-b">
                                        Your Events joins
                                    </div>
                                    <table className="table table-border table-hover table-center">
                                        <thead className="thead-l">
                                        <tr>
                                            <th style={{width: '50%'}}>Project</th>
                                            <th className="table-name text-center"
                                                style={{width: '15%'}}>Category
                                            </th>
                                            <th className="table-name text-center" style={{width: '15%'}}>Nombre
                                                users
                                            </th>
                                            <th className="text-center" style={{width: '20%'}}>Type</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {
                                            this.state.eventsJoin.map(d => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <h4 className="h5 mt-15 mb-2">
                                                                <Link to={'/event/show/' + d.slug}>{d.title}</Link>
                                                            </h4>
                                                            <p className="d-none d-md-block text-muted">{d.content}</p>

                                                        </td>
                                                        <td className="table-name text-center">
                                                            <span className="badge badge-success">{d.name}</span>
                                                        </td>
                                                        <td className="table-name font-size-xl text-center font-w600">{d.users_max}</td>

                                                        <td className="table-name text-center">
                                                            <span className="badge badge-success">{d.type_event}</span>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </HeaderHome>
        )
    }
}
