import React, { useState, useCallback } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Courses from "./AdCourses/Courses.jsx";
import Users from "./AdUsers/Users.jsx";
import Lessons from "./Adlessons/lessons.jsx";
import Certificates from "./AdCertificates/Certificates.jsx";
import BlogManagement from "./BlogManagement/BlogManagement.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import AdminAddCoupon from "./Adcoupon/Adcoupon.jsx";

const { Header, Content, Sider } = Layout;

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:9000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }, []);

  const fetchCourses = useCallback(async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:9000/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }, []);

  const fetchLessons = useCallback(async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:9000/api/lessons", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }, []);

  const fetchModules = useCallback(async (courseId) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:9000/api/courses/${courseId}/modules`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }, []);

  const renderContent = () => {
    switch (selectedMenu) {
      case "certificates":
        return (
          <Certificates fetchUsers={fetchUsers} fetchCourses={fetchCourses} />
        );
      case "courses":
        return <Courses fetchCourses={fetchCourses} />;
      case "lessons":
        return (
          <Lessons
            fetchLessons={fetchLessons}
            fetchCourses={fetchCourses}
            fetchModules={fetchModules}
          />
        );
      case "users":
        return <Users fetchUsers={fetchUsers} />;
      case "blog":
        return <BlogManagement />;
      case "Dashboard":
        return <Dashboard />;
      case "AdminAddCoupon":
        return <AdminAddCoupon />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div
          className="logo"
          style={{
            height: "64px",
            padding: "16px",
            color: "white",
            marginTop: 20,
          }}
        >
          Danh Mục
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["Dashboard"]}
          onClick={({ key }) => setSelectedMenu(key)}
        >
          <Menu.Item key="Dashboard" icon={<AppstoreOutlined />}>
            Tổng Quan
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>
            Người Dùng
          </Menu.Item>
          <Menu.Item key="courses" icon={<BookOutlined />}>
            Khóa Học
          </Menu.Item>
          <Menu.Item key="lessons" icon={<PlayCircleOutlined />}>
            Chương & Bài Học
          </Menu.Item>
          <Menu.Item key="certificates" icon={<TrophyOutlined />}>
            Chứng Chỉ
          </Menu.Item>
          <Menu.Item key="blog" icon={<FileTextOutlined />}>
            Bài Viết
          </Menu.Item>
          <Menu.Item key="AdminAddCoupon" icon={<FileTextOutlined />}>
            Mã Giảm Giá
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 20 }}>Quản Trị Viên</h2>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            icon={
              <img
                width="24"
                height="24"
                src="https://img.icons8.com/stencil/32/exit.png"
                alt="exit"
              />
            }
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
