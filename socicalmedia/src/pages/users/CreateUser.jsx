import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Form} from "antd";
import {useNavigate} from "react-router-dom";
import $ from 'jquery';
import userService from "../../services/UserService";
import {BASE_URL_SERVER} from "../../config/server";

export default function CreateUser() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const onFinish = async () => {
        $('#btnCreate').prop('disabled', true).text('Đang tạo mới...');

        let inputs = $('#formCreate input, #formCreate textarea, #formCreate select');
        for (let i = 0; i < inputs.length; i++) {
            if (!$(inputs[i]).val()) {
                let text = $(inputs[i]).prev().text();
                alert(text + ' không được bỏ trống!');
                $('#btnCreate').prop('disabled', false).text('Tạo mới');
                return
            }
        }

        const formData = new FormData($('#formCreate')[0]);

        await userService.adminCreateUser(formData)
            .then((res) => {
                console.log("create user", res.data)
                alert("Tạo tài khoản thành công!")
                navigate("/admin/users/list")
            })
            .catch((err) => {
                console.log(err)
                alert(err.response.data.message)
                $('#btnCreate').prop('disabled', false).text('Tạo mới');
            })
    };

    useEffect(() => {
        setLoading(true);
    }, [loading]);


    return (
        <>
            <Header/>
            <Sidebar/>

            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Thêm mới tài khoản</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/home">Trang quản trị</Link></li>
                            <li className="breadcrumb-item">Tài khoản</li>
                            <li className="breadcrumb-item active">Thêm mới tài khoản</li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Tạo tài khoản</h5>
                                    <Form onFinish={onFinish} id="formCreate">
                                        <div className="form-group">
                                            <label htmlFor="username">Tên tài khoản</label>
                                            <input type="text" name="username" className="form-control" id="username"
                                                   required/>
                                        </div>
                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="email">Email</label>
                                                <input type="email" name="email" className="form-control"
                                                       id="email" required/>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="phone">Số điện thoại</label>
                                                <input type="text" name="phone" className="form-control"
                                                       id="phone" required/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="password">Mật khẩu</label>
                                                <input type="password" name="password" className="form-control"
                                                       id="password" required/>
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label htmlFor="password_confirm">Nhập lại mật khẩu</label>
                                                <input type="password" name="password_confirm" className="form-control"
                                                       id="password_confirm" required/>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="form-group col-md-6">
                                                <label htmlFor="profilepicture">Ảnh đại diện</label>
                                                <input type="file" name="profilepicture" className="form-control"
                                                       id="profilepicture" required/>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <button type="submit" id="btnCreate" className="btn btn-primary mt-3">Tạo
                                                mới
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