import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Spin, Alert } from "antd";
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchdashboardAPI } from "../../Api/IntroduceAPI.js";
import "aos/dist/aos.css";
import AOS from "aos";

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totals: {
      users: 0,
      courses: 0,
      certificates: 0,
      revenue: 0,
    },
    monthlyData: [],
    topCourses: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
        const data = await fetchdashboardAPI(token);
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card
      data-aos="fade-up"
      bodyStyle={{ padding: "24px" }}
      style={{ height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ color: "#8c8c8c", fontSize: "14px" }}>{title}</div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", marginTop: "8px" }}
          >
            {value}
          </div>
        </div>
        <div
          style={{
            backgroundColor: color,
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ fontSize: "24px", color: "white" }} />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  const { totals, monthlyData, topCourses } = dashboardData;

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} data-aos="fade-right">
        Tổng Quan
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Học Viên"
            value={totals.users.toLocaleString()}
            icon={UserOutlined}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Khóa Học"
            value={totals.courses.toLocaleString()}
            icon={BookOutlined}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh Thu (VND)"
            value={`$${totals.revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={DollarOutlined}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Chứng Chỉ Đã Cấp"
            value={totals.certificates.toLocaleString()}
            icon={TrophyOutlined}
            color="#722ed1"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Thống Kê Tháng" data-aos="fade-up" data-aos-delay="100">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#1890ff"
                  name="Học Viên"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  name="Doanh Thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Khóa Học Bật Nhất"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCourses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#1890ff" name="Học Viên" />
                <Bar dataKey="revenue" fill="#52c41a" name="Doanh Thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
