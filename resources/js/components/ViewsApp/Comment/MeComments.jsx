import React, {PureComponent} from "react";

// IMPORT IMAGE
import imgAvatar from '@img/02th-egg-person.jpg'
import HeaderHome from "../HeaderHome";
import $ from "jquery";
import moment from "moment";
import {Link} from "react-router-dom";
import ModalForm from "./ModalForm";
import * as axios from "axios";
import {NotifAppMessage} from "../../LayoutApp";
import ReactPaginate from "react-paginate";

export default class MeComments extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            commentID: 0,
            modalActive: false,
            commentValue: '',
            lastPage: 0,
            perPage: 0
        };
        this.onHandleClickUpdate = this.onHandleClickUpdate.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this)
    }

    onHandleClickUpdate(event, content) {
        event.preventDefault();

        let commentID = event.target.getAttribute('id').split('comment-')[1];

        if (commentID !== '') {
            this.setState({
                commentID: commentID,
                modalActive: !this.state.modalActive,
                commentValue: content
            })
        }
    }

    handleClose(event) {
        event.preventDefault();
        this.setState({modalActive: !this.state.modalActive});
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({commentValue: event.target.value})
    }

    handleSubmit(event) {
        event.preventDefault();

        if (this.state.commentValue.length > 0 && this.state.commentID !== '') {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            let user = JSON.parse(localStorage.getItem('appState'));

            const params = {
                commentValue: this.state.commentValue,
                user: user
            };

            axios.post('/api/me_comments/update/' + this.state.commentID, {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({modalActive: !this.state.modalActive});
                    this.setState({
                        comments: this.state.comments.map(d => {
                            if (d.nameReply) {
                                return {
                                    content: d.id === parseInt(this.state.commentID) ? this.state.commentValue : d.content,
                                    created_at: d.created_at,
                                    id: d.id,
                                    reply_id: d.reply_id,
                                    updated_at: d.updated_at,
                                    nameReply: d.nameReply
                                }
                            }
                            return {
                                content: d.id === parseInt(this.state.commentID) ? this.state.commentValue : d.content,
                                created_at: d.created_at,
                                id: d.id,
                                reply_id: d.reply_id,
                                updated_at: d.updated_at,
                            }
                        })
                    });
                    NotifAppMessage('success', response.data.message, 'Well Done !!!');
                } else {
                    NotifAppMessage('danger', response.data.message, 'Error Found !!!');
                }
            })
        } else {
            NotifAppMessage('danger', 'Your Comment Field is too short !!!', 'Error Found !!!');
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

            axios.get('/api/me_comments/' + user.user.auth_token, {
                headers: headers
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        comments: Object.values(response.data.data.comments.data),
                        perPage: response.data.data.comments.perPage,
                        lastPage: response.data.data.comments.countPage
                    })
                }
            })
        }
    }

    handlePageClick(data)
    {
        const selected = data.selected;
        const user = JSON.parse(localStorage.getItem('appState'));

        if (user) {
            const headers = {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            };

            const params = {
                selectedPage: selected,
                perPage: this.state.perPage,
                authToken: user.user.auth_token
            };

            axios.post('/api/pagination/MyComments', {
                headers: headers,
                params: params
            }).then(response => {
                if (response.data.success === true) {
                    this.setState({
                        comments: Object.values(response.data.data.comments.data)
                    })
                }
            })
        }
    }

    render() {
        const {lastPage} = this.state;

        return (
            <HeaderHome>
                <main id="main-container">
                    <div className="content">
                        <div className="block">
                            <div className="block-header block-header-default">
                                <h3 className="block-title">Yours comments</h3>
                            </div>
                            {
                                this.state.comments.length === 0 &&
                                <div className="block-content block-content-full">
                                    <div className="text-center">
                                        <h2 className="font-w600">Aucun Commentaire effectué</h2>
                                    </div>
                                </div>
                            }
                            {
                                this.state.comments.map(d => {
                                    return (
                                        <div className='block-content block-content-full'>
                                            <table className="table table-border">
                                                <tbody>
                                                <tr className="table-active">
                                                    <td className="d-none table-name"></td>
                                                    <td className="font-size-sm text-muted">
                                                        Edité :
                                                        <em> {moment(d.updated_at).format('MM/DD/YY')}</em>
                                                    </td>
                                                </tr>
                                                <tr className="table-active">
                                                    <td className="d-none table-name"></td>
                                                    {
                                                        d.nameReply ?
                                                            <td className="font-size-sm text-muted">
                                                                Réponse à
                                                                <Link className=""
                                                                      to={'/profile/' + d.nameReply}> {d.nameReply} </Link>
                                                                <em>{moment(d.created_at).format('MMMM Do, YYYY h:mm')}</em>
                                                            </td>
                                                            :
                                                            <td className="font-size-sm text-muted">
                                                                <em>{moment(d.created_at).format('MMMM Do, YYYY h:mm')}</em>
                                                            </td>
                                                    }
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <p>
                                                            {d.content}
                                                        </p>
                                                        <hr/>
                                                        Cliquez
                                                        <a href="#"
                                                           onClick={e => this.onHandleClickUpdate(e, d.content)}
                                                           id={'comment-' + d.id}> ici </a>
                                                        pour modifier le commentaire
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <ReactPaginate
                            previousLabel={'Previous'}
                            nextLabel={'Next'}
                            breakLabel={'...'}
                            breakClassName={'break-me'}
                            pageCount={lastPage}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={this.handlePageClick}
                            containerClassName={'pagination'}
                            pageClassName={'paginate_button page-item'}
                            subContainerClassName={'pages pagination'}
                            activeClassName={'active'}
                            pageLinkClassName={'page-link'}
                            previousClassName={'paginate_button page-item previous'}
                            previousLinkClassName={'page-link'}
                            nextClassName={'paginate_button page-item next'}
                            nextLinkClassName={'page-link'}
                        />
                    </div>
                </main>
                <ModalForm activeModal={this.state.modalActive} commentID={this.state.commentID}
                           handleSubmit={this.handleSubmit}
                           handleChange={this.handleChange}
                           handleClose={this.handleClose}
                           commentValue={this.state.commentValue}/>
            </HeaderHome>
        )
    }
}
