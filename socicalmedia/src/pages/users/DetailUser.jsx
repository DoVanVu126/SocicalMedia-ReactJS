import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Form} from "antd";
import React, {useEffect, useState} from "react";
import userService from "../../services/UserService";
import $ from 'jquery';
import {BASE_URL_SERVER} from "../../config/server";

export default function DetailUser() {
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const {id} = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async () => {
        $('#btnUpdate').prop('disabled', true).text('Đang lưu...');

        let inputs = $('#formUpdate input, #formUpdate textarea, #formUpdate select');
        for (let i = 0; i < inputs.length; i++) {
            if (!$(inputs[i]).val() && $(inputs[i]).attr('type') !== 'file' && $(inputs[i]).attr('type') !== 'password') {
                let text = $(inputs[i]).prev().text();
                alert(text + ' không được bỏ trống!');
                $('#btnUpdate').prop('disabled', false).text('Lưu lại');
                return
            }
        }

        const formData = new FormData($('#formUpdate')[0]);

        await userService.adminUpdateUser(id, formData)
            .then((res) => {
                console.log("create user", res.data)
                alert("Lưu tài khoản thành công!")
                navigate("/admin/users/list")
            })
            .catch((err) => {
                console.log(err)
                alert(err.response.data.message)
                $('#btnUpdate').prop('disabled', false).text('Lưu lại');
            })
    };

    const detailUser = async () => {
        await userService.adminDetailUser(id)
            .then((res) => {
                setUser(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err)
                setLoading(false);
            })
    };


    useEffect(() => {
        detailUser();
    }, [form, id, loading])

    return (
        <>
            <Header/>
            <Sidebar/>

            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Chỉnh sửa tài khoản</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/home">Trang quản trị</Link></li>
                            <li className="breadcrumb-item">Tài khoản</li>
                            <li className="breadcrumb-item active">Chỉnh sửa tài khoản</li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Chỉnh sửa tài khoản</h5>
                                    <Form onFinish={onFinish} id="formUpdate">
                                        <div className="form-group">
                                            <label htmlFor="username">Tên tài khoản</label>
                                            <input type="text" name="username" className="form-control" id="username"
                                                   defaultValue={user.username}
                                                   required/>
                                        </div>
                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="email">Email</label>
                                                <input type="email" name="email" className="form-control"
                                                       defaultValue={user.email}
                                                       id="email" required/>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="phone">Số điện thoại</label>
                                                <input type="text" name="phone" className="form-control"
                                                       defaultValue={user.phone}
                                                       id="phone" required/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="password">Mật khẩu</label>
                                                <input type="password" name="password" className="form-control"
                                                       id="password"/>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="password_confirm">Nhập lại mật khẩu</label>
                                                <input type="password" name="password_confirm" className="form-control"
                                                       id="password_confirm"/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="profilepicture">Ảnh đại diện</label>
                                                <input type="file" name="profilepicture" className="form-control"
                                                       id="profilepicture"/>
                                                <img src={BASE_URL_SERVER + user.profilepicture} alt="" className="mt-3"
                                                     style={{width: '100px'}}/>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <button type="submit" id="btnUpdate" className="btn btn-primary mt-3">Lưu
                                                lại
                                            </button>
                                        </div>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}