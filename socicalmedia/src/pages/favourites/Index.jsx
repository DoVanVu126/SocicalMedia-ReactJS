import React, {useEffect, useState} from 'react'
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {Link} from 'react-router-dom';
import "../../style/home-custom.css";
import favouriteService from "../../services/FavouriteService";
import Loading from "../../components/Loading";
import {BASE_URL_SERVER} from "../../config/server";
import savePostService from "../../services/SavePostService";
import postService from "../../services/PostService";

export default function ShowPage() {
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const [posts, setPosts] = useState([]);

    const addOrUpdateFavourite = async (id) => {
        setLoading(true);
        const data = {
            user_id: user.id,
            post_id: id
        }
        await favouriteService.addUpdateFavourite(data)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setLoading(false)
                    getListPost();
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

    const addOrUpdateSave = async (id) => {
        setLoading(true);
        const data = {
            user_id: user.id,
            post_id: id
        }
        await savePostService.addUpdateSave(data)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setLoading(false)
                    getListPost();
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

    const sharePost = async (id) => {
        setLoading(true);
        const data = {
            user_id: user.id,
            post_id: id
        }
        await postService.sharePost(data)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    alert('Chia sẻ bài viết thành công!')
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

    const getListPost = async () => {
        setLoading(true);
        await favouriteService.showListPost(user.id)
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setLoading(false)
                    setPosts(res.data.data)
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
        getListPost();
    }, []);

    return (
        <>
            <Header/>
            <Sidebar/>

            {loading && <Loading/>}

            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Bài viết yêu thích</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/home">Trang quản trị</Link></li>
                            <li className="breadcrumb-item">Bài viết yêu thích</li>
                            <li className="breadcrumb-item active">Bài viết yêu thích</li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-12 position-relative">
                            <div className="card recent-sales overflow-auto">
                                <div className="card-body">
                                    <h5 className="card-title">Bài viết bạn yêu thích</h5>

                                    {posts.map((item, index) => {
                                        const imageUrl = item.post.imageurl
                                            ? BASE_URL_SERVER + '/storage/images/' + item.post.imageurl
                                            : '/no-image.jpg';

                                        return (
                                            <div className="card mb-3" key={index}>
                                                <div className="d-flex justify-content-end mb-2">
                                                    <div className="dropdown mx-2 p-1">
                                                        <a href="#" data-bs-toggle="dropdown"
                                                           aria-expanded="false">
                                                            <i className="bi bi-three-dots"></i>
                                                        </a>
                                                        <ul className="dropdown-menu small">
                                                            <li>
                                                                <a className="dropdown-item" href="#"
                                                                   onClick={() => addOrUpdateSave(item.post.id)}>
                                                                    <i className="bi bi-bookmarks"></i> Lưu trữ
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a className="dropdown-item" href="#"
                                                                   onClick={() => addOrUpdateFavourite(item.post.id)}>
                                                                    <i className="bi bi-heartbreak"></i> Bỏ yêu
                                                                    thích
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a className="dropdown-item" href="#"
                                                                   onClick={() => sharePost(item.post.id)}>
                                                                    <i className="bi bi-share"></i> Chia sẻ nhanh
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <img src={imageUrl} style={{maxHeight: '200px', objectFit: 'contain'}}
                                                     className="card-img-top" alt="Post image"/>
                                                <div className="card-body">
                                                    <p className="card-text">{item.post.content || 'No description available.'}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}