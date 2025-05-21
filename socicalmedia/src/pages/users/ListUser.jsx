import React, {useEffect, useState} from 'react'
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {Table} from 'antd';
import {Link} from 'react-router-dom';
import userService from "../../services/UserService";
import "../../style/home-custom.css";

export default function ListUser() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (id) => {
        setLoading(true)
        if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
            await userService.adminDeleteUser(id)
                .then((res) => {
                    console.log("delete", res.data)
                    alert(`Xóa thành công!`)
                    getListUser();
                    setLoading(false)
                })
                .catch((err) => {
                    alert(err.response.data.message)
                    console.log(err);
                    setLoading(false);
                })
        }
        setLoading(false);
    }

    const columns = [
        {
            title: 'STT',
            dataIndex: 'key',
            width: '10%',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên',
            dataIndex: 'username',
            width: 'x',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: '20%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: '20%',
        },
        {
            title: 'Hành động',
            dataIndex: 'id',
            key: 'x',
            width: '100px',
            render: (id) =>
                <div className="d-flex gap-2 align-items-center justify-content-center">
                    <Link to={`/admin/users/detail/${id}`} className="btn btn-sm btn-primary">
                        <i className="bi bi-eye"></i>
                    </Link>

                    <button type="button" id={`btnDelete_${id}`} className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(id)}><i className="bi bi-trash"></i>
                    </button>
                </div>
        },
    ];

    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const getListUser = async () => {
        await userService.adminListUser()
            .then((res) => {
                if (res.status === 200) {
                    console.log("data", res.data)
                    setData(res.data.data)
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

    useEffect(() => {
        getListUser();

    }, []);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <>
            <Header/>
            <Sidebar/>

            <main id="main" className="main">
                <div className="pagetitle">
                    <h1>Danh sách tài khoản</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/home">Trang quản trị</Link></li>
                            <li className="breadcrumb-item">Tài khoản</li>
                            <li className="breadcrumb-item active">Danh sách tài khoản</li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <Table
                            style={{margin: "auto"}}
                            columns={columns}
                            dataSource={data}
                            pagination={tableParams.pagination}
                            loading={loading}
                            onChange={handleTableChange}
                            locale={{emptyText: "No data available"}}
                        />
                    </div>
                </section>
            </main>
        </>
    );
}