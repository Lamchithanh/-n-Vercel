import React, { useState, useCallback } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
  AppstoreOutlined,
  TrophyOutlined,
  FileTextOutlined,
  TagOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Courses from "./AdCourses/Courses.jsx";
import Users from "./AdUsers/Users.jsx";
import Lessons from "./Adlessons/lessons.jsx";
import Certificates from "./AdCertificates/Certificates.jsx";
import BlogManagement from "./BlogManagement/BlogManagement.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import AdminAddCoupon from "./Adcoupon/Adcoupon.jsx";
import "./Admindashboard.scss";
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
    <Layout style={{ minHeight: "100vh" }} className="AdminDashboard_playout">
      <Sider className="AdminDashboard_sider">
        <div
          className="AdminDashboard_logo"
          style={{
            height: "64px",
            padding: "16px",
            color: "white",
            marginTop: 20,
          }}
        >
          <h4>Danh Mục</h4>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["Dashboard"]}
          onClick={({ key }) => setSelectedMenu(key)}
          className="AdminDashboard_menu"
        >
          <Menu.Item
            key="Dashboard"
            icon={<AppstoreOutlined />}
            className="AdminDashboard_menuItem"
          >
            Tổng Quan
          </Menu.Item>
          <Menu.Item
            key="users"
            icon={<UserOutlined />}
            className="AdminDashboard_menuItem"
          >
            Người Dùng
          </Menu.Item>
          <Menu.Item
            key="courses"
            icon={<BookOutlined />}
            className="AdminDashboard_menuItem"
          >
            Khóa Học
          </Menu.Item>
          <Menu.Item
            key="lessons"
            icon={<PlayCircleOutlined />}
            className="AdminDashboard_menuItem"
          >
            Chương & Bài Học
          </Menu.Item>
          <Menu.Item
            key="certificates"
            icon={<TrophyOutlined />}
            className="AdminDashboard_menuItem"
          >
            Chứng Chỉ
          </Menu.Item>
          <Menu.Item
            key="blog"
            icon={<FileTextOutlined />}
            className="AdminDashboard_menuItem"
          >
            Bài Viết
          </Menu.Item>
          <Menu.Item
            key="AdminAddCoupon"
            icon={<TagOutlined />}
            className="AdminDashboard_menuItem"
          >
            Mã Giảm Giá
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#141443",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 20, color: "#e6356f" }}>Quản Trị Viên</h2>
          <Button
            className="btn_logout"
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
            minHeight: 280,
          }}
          className="Admindashboard_content"
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
