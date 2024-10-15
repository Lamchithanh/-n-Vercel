// AdminDashboard.js
import React, { useState, useCallback } from "react";
import { Layout, Menu, Button } from "antd";
import { UserOutlined, BookOutlined } from "@ant-design/icons";
import axios from "axios";
import Courses from "./AdCourses/Courses.jsx";
import Users from "./AdUsers/Users.jsx";

const { Header, Content, Sider } = Layout;

const AdminDashboard = () => {
    const [selectedMenu, setSelectedMenu] = useState("users");

    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:9000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }, []);

    const fetchCourses = useCallback(async () => {
        const response = await axios.get("http://localhost:9000/api/courses");
        return response.data;
    }, []);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["users"]}
                    onClick={({ key }) => setSelectedMenu(key)}
                >
                    <Menu.Item key="users" icon={<UserOutlined />}>
                        Users
                    </Menu.Item>
                    <Menu.Item key="courses" icon={<BookOutlined />}>
                        Courses
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: "#fff", padding: 0 }}>
                    <Button
                        style={{ float: "right", margin: "16px" }}
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                        }}
                    >
                        <img
                            width="32"
                            height="32"
                            src="https://img.icons8.com/stencil/32/exit.png"
                            alt="exit"
                        />
                    </Button>
                    <h2 style={{ margin: "0 16px" }}>Admin Dashboard</h2>
                </Header>
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        background: "#fff",
                    }}
                >
                    {selectedMenu === "users" && (
                        <Users fetchUsers={fetchUsers} />
                    )}
                    {selectedMenu === "courses" && (
                        <Courses fetchCourses={fetchCourses} />
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
