import React, { useState, useCallback } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Courses from "./AdCourses/Courses.jsx";
import Users from "./AdUsers/Users.jsx";
import Lessons from "./Adlessons/lessons.jsx"; // Import your new Lessons component

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

  const fetchLessons = useCallback(async () => {
    const response = await axios.get("http://localhost:9000/api/lessons");
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
          <Menu.Item key="lessons" icon={<PlayCircleOutlined />}>
            Lessons
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
          {selectedMenu === "users" && <Users fetchUsers={fetchUsers} />}
          {selectedMenu === "courses" && (
            <Courses fetchCourses={fetchCourses} />
          )}
          {selectedMenu === "lessons" && (
            <Lessons fetchLessons={fetchLessons} /> // Render Lessons component
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
