import React, {useEffect, useState} from 'react'
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {Link} from 'react-router-dom';
import "../../style/home-custom.css";
import friendService from "../../services/FriendService";
import {BASE_URL_SERVER} from "../../config/server";
import Loading from "../../components/Loading";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

export default function ShowPage() {
    const [dataFriend, setDataFriend] = useState([]);
    const [dataFriendRequest, setDataFriendRequest] = useState([]);
    const [dataFriendPending, setDataFriendPending] = useState([]);
    const [dataNoFriend, setDataNoFriend] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    dayjs.extend(relativeTime);
    dayjs.locale('vi');

    const changeTime = (lastOnline) => {
        return dayjs(lastOnline).fromNow();
    }

    const getListFriend = async () => {
        await friendService.showListFriend(user.id)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setDataFriend(res.data.data)
                    setLoading(false)
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const getListFriendRequest = async () => {
        await friendService.showListFriendRequest(user.id)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setDataFriendRequest(res.data.data)
                    setLoading(false)
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const getListFriendPending = async () => {
        await friendService.showListFriendPending(user.id)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setDataFriendPending(res.data.data)
                    setLoading(false)
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const getListNoFriend = async () => {
        await friendService.showListNoFriend(user.id)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setDataNoFriend(res.data.data)
                    setLoading(false)
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const addFriend = async (receiverID) => {
        setLoading(true);
        const data = {
            receiver_id: receiverID,
            sender_id: user.id,
        }
        await friendService.initFriendRequest(data)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setLoading(false)
                    getListFriendPending();
                    getListFriendRequest();
                    getListNoFriend();
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const acceptFriend = async (id) => {
        setLoading(true);
        const data = {
            id: id,
        }
        await friendService.acceptFriend(data)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setLoading(false)
                    getListFriendPending();
                    getListFriendRequest();
                    getListNoFriend();
                    getListFriend()
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const rejectFriend = async (id) => {
        setLoading(true);
        const data = {
            id: id,
        }

        await friendService.rejectFriend(data)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setLoading(false)
                    getListFriendPending();
                    getListFriendRequest();
                    getListNoFriend();
                    getListFriend()
                } else {
                    alert('Error')
                    setLoading(false)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    useEffect(() => {
        getListFriend();
        getListFriendRequest();
        getListFriendPending();
        getListNoFriend();
    }, []);

    return (
        <>
            <Header/>
            <Sidebar/>

            {loading && <Loading/>}

            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Danh sách bạn bè</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/home">Trang quản trị</Link></li>
                            <li className="breadcrumb-item">Bạn bè</li>
                            <li className="breadcrumb-item active">Danh sách bạn bè</li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-12 position-relative">
                            <div className="card recent-sales overflow-auto">
                                <div className="card-body">
                                    <h5 className="card-title">Quản lí bạn bè</h5>

                                    <ul className="nav nav-tabs pt-2 position-sticky top-0 z-3 bg-white" id="myTab"
                                        role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link position-relative active" id="home-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#home" type="button" role="tab" aria-controls="home"
                                                    aria-selected="true">
                                                Danh sách bạn bè
                                                <span
                                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                    {dataFriend.length > 99 ? '99+' : dataFriend.length}
                                                    <span className="visually-hidden">bạn bè</span>
                                                  </span>
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link position-relative" id="profile-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#profile" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false">
                                                Lời mời kết bạn
                                                <span
                                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                   {dataFriendRequest.length > 99 ? '99+' : dataFriendRequest.length}
                                                    <span className="visually-hidden">bạn bè</span>
                                                  </span>
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="contact-tab" data-bs-toggle="tab"
                                                    data-bs-target="#contact" type="button" role="tab"
                                                    aria-controls="contact" aria-selected="false">
                                                Thêm bạn bè
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="tab-content" id="myTabContent">
                                        <div className="tab-pane fade show active" id="home" role="tabpanel"
                                             aria-labelledby="home-tab">
                                            <div className="widget stick-widget mt-3">
                                                <h4 className="widget-title h5">Tất cả bạn bè</h4>
                                                <h6 className="h6">{dataFriend.length} người bạn</h6>
                                                <ul className="followers">
                                                    {
                                                        dataFriend.map((item, index) => {
                                                            const avatarUrl = item.profilepicture
                                                                ? BASE_URL_SERVER + '/storage/images/' + item.profilepicture
                                                                : '/default-avatar.png';

                                                            return (
                                                                <li key={index}
                                                                    className="d-flex justify-content-between align-items-center mb-3">
                                                                    <div className="d-flex gap-2">
                                                                        <figure className="position-relative">
                                                                            <img
                                                                                style={{
                                                                                    width: '50px',
                                                                                    height: '50px',
                                                                                    borderRadius: '50%'
                                                                                }}
                                                                                src={avatarUrl}
                                                                                alt=""
                                                                            />
                                                                            {item.is_online ? (
                                                                                <span className="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                                                                    <span className="visually-hidden">---</span>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="position-absolute top-0 start-100 translate-middle p-2 bg-secondary border border-light rounded-circle">
                                                                                    <span className="visually-hidden">Offline</span>
                                                                                </span>
                                                                            )}

                                                                        </figure>
                                                                        <div className="friend-meta ">
                                                                            <h4 className="h6 mb-2 ">{item.username}</h4>
                                                                            {item.is_online ? (
                                                                                <p className="small">Đang hoạt động</p>
                                                                            ) : (
                                                                                <p className="small">Hoạt động {changeTime(item.last_online_at)}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="btn-group">
                                                                        <div style={{cursor: "pointer"}}
                                                                             className=""
                                                                             data-bs-toggle="dropdown"
                                                                             aria-expanded="false">
                                                                            <i className="bi bi-three-dots"></i>
                                                                        </div>
                                                                        <ul className="dropdown-menu dropdown-menu-end">
                                                                            <li>
                                                                                <button className="dropdown-item"
                                                                                        type="button">Xem thông tin cá
                                                                                    nhân
                                                                                </button>
                                                                            </li>
                                                                            <li>
                                                                                <button className="dropdown-item"
                                                                                        type="button">Hủy bạn bè
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </li>

                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="tab-pane fade" id="profile" role="tabpanel"
                                             aria-labelledby="profile-tab">
                                            <div className="widget stick-widget mt-3">
                                                <h4 className="widget-title h5">Lời mời kết bạn</h4>
                                                <h6 className="h6">{dataFriendPending.length} lời mời kết bạn</h6>
                                                <ul className="followers">
                                                    {
                                                        dataFriendPending.map((item, index) => {
                                                            const avatarUrl = item.profilepicture
                                                                ? BASE_URL_SERVER + '/storage/images/' + item.profilepicture
                                                                : '/default-avatar.png';

                                                            return (
                                                                <li key={index}>
                                                                    <figure className="position-relative">
                                                                        <img
                                                                            style={{
                                                                                width: '50px',
                                                                                height: '50px',
                                                                                borderRadius: '50%'
                                                                            }}
                                                                            src={avatarUrl}
                                                                            alt=""
                                                                        />
                                                                        {item.is_online ? (
                                                                            <span className="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                                                                    <span className="visually-hidden">---</span>
                                                                                </span>
                                                                        ) : (
                                                                            <span className="position-absolute top-0 start-100 translate-middle p-2 bg-secondary border border-light rounded-circle">
                                                                                    <span className="visually-hidden">Offline</span>
                                                                                </span>
                                                                        )}

                                                                    </figure>
                                                                    <div className="friend-meta mx-3">
                                                                        <h4 className="h6 mb-2 ">{item.username}</h4>
                                                                        <div
                                                                            className="w-100 d-flex justify-content-start gap-3 align-items-center">
                                                                            <button type="button" title="Thêm bạn bè"
                                                                                    onClick={() => acceptFriend(item.id)}
                                                                                    className="btn btn-sm btn-primary">
                                                                                Xác nhận
                                                                            </button>
                                                                            <button type="button" title="Xoá"
                                                                                    onClick={() => rejectFriend(item.id)}
                                                                                    className="btn btn-sm btn-outline-secondary">
                                                                                Xoá
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </li>

                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                            <div className="widget stick-widget mt-5">
                                                <h4 className="widget-title h5">Lời mời đã gửi</h4>
                                                <h6 className="h6">Đã gửi {dataFriendRequest.length} lời mời</h6>
                                                <ul className="followers">
                                                    {
                                                        dataFriendRequest.map((item, index) => {
                                                            const avatarUrl = item.profilepicture
                                                                ? BASE_URL_SERVER + '/storage/images/' + item.profilepicture
                                                                : '/default-avatar.png';

                                                            return (
                                                                <li key={index}
                                                                    className="d-flex justify-content-between align-items-center mb-3">
                                                                    <div className="d-flex gap-2">
                                                                        <figure className="position-relative">
                                                                            <img
                                                                                style={{
                                                                                    width: '50px',
                                                                                    height: '50px',
                                                                                    borderRadius: '50%'
                                                                                }}
                                                                                src={avatarUrl}
                                                                                alt=""
                                                                            />
                                                                            {item.is_online ? (
                                                                                <span className="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                                                                    <span className="visually-hidden">---</span>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="position-absolute top-0 start-100 translate-middle p-2 bg-secondary border border-light rounded-circle">
                                                                                    <span className="visually-hidden">Offline</span>
                                                                                </span>
                                                                            )}

                                                                        </figure>
                                                                        <div className="friend-meta">
                                                                            <h4 className="h6 mb-2 ">{item.username}</h4>
                                                                        </div>
                                                                    </div>

                                                                    <button type="button" title="Hủy lời mời"
                                                                            onClick={() => rejectFriend(item.id)}
                                                                            className="btn btn-sm btn-outline-secondary">
                                                                        Hủy lời mời
                                                                    </button>
                                                                </li>

                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="tab-pane fade" id="contact" role="tabpanel"
                                             aria-labelledby="contact-tab">
                                            <div className="widget stick-widget mt-3">
                                                <h4 className="widget-title h5">Đề xuất kết bạn</h4>
                                                <h6 className="h6">Những người bạn có thể biết</h6>
                                                <ul className="followers">
                                                    {
                                                        dataNoFriend.map((item, index) => {
                                                            const avatarUrl = item.profilepicture
                                                                ? BASE_URL_SERVER + '/storage/images/' + item.profilepicture
                                                                : '/default-avatar.png';

                                                            return (
                                                                <li key={index}>
                                                                    <figure className="position-relative">
                                                                        <img
                                                                            style={{
                                                                                width: '50px',
                                                                                height: '50px',
                                                                                borderRadius: '50%'
                                                                            }}
                                                                            src={avatarUrl}
                                                                            alt=""
                                                                        />
                                                                        {item.is_online ? (
                                                                            <span className="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                                                                    <span className="visually-hidden">---</span>
                                                                                </span>
                                                                        ) : (
                                                                            <span className="position-absolute top-0 start-100 translate-middle p-2 bg-secondary border border-light rounded-circle">
                                                                                    <span className="visually-hidden">Offline</span>
                                                                                </span>
                                                                        )}

                                                                    </figure>
                                                                    <div className="friend-meta mx-3">
                                                                        <h4 className="h6 mb-2 ">{item.username}</h4>
                                                                        <button type="button" title="Thêm bạn bè"
                                                                                onClick={() => addFriend(item.id)}
                                                                                className="btn btn-sm btn-primary">
                                                                            Thêm bạn bè
                                                                        </button>
                                                                    </div>
                                                                </li>

                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}