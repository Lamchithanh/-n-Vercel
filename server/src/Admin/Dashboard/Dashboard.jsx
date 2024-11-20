import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  RiseOutlined,
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
import "aos/dist/aos.css";
import AOS from "aos";

const { Title } = Typography;

// Giả lập dữ liệu thống kê
const monthlyData = [
  { name: "Jan", students: 120, courses: 15, revenue: 3000 },
  { name: "Feb", students: 150, courses: 18, revenue: 3800 },
  { name: "Mar", students: 200, courses: 22, revenue: 5000 },
  { name: "Apr", students: 180, courses: 25, revenue: 4500 },
  { name: "May", students: 220, courses: 28, revenue: 5500 },
  { name: "Jun", students: 250, courses: 30, revenue: 6200 },
];

const topCourses = [
  { name: "React Fundamentals", students: 450, revenue: 11250 },
  { name: "JavaScript Advanced", students: 380, revenue: 9500 },
  { name: "Python for Beginners", students: 320, revenue: 8000 },
  { name: "Web Development", students: 300, revenue: 7500 },
];

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    // Tính toán tổng số liệu
    const lastMonth = monthlyData[monthlyData.length - 1];
    setTotalStudents(lastMonth.students);
    setTotalCourses(lastMonth.courses);
    setTotalRevenue(lastMonth.revenue);
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

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} data-aos="fade-right">
        Dashboard
      </Title>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Học Viên"
            value={totalStudents}
            icon={UserOutlined}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng Khóa Học"
            value={totalCourses}
            icon={BookOutlined}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh Thu (USD)"
            value={`$${totalRevenue}`}
            icon={DollarOutlined}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tăng Trưởng"
            value="15.3%"
            icon={RiseOutlined}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Biểu đồ thống kê */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Thống Kê Theo Tháng"
            data-aos="fade-up"
            data-aos-delay="100"
          >
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
                  name="Học viên"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Khóa Học Nổi Bật"
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
                <Bar dataKey="students" fill="#1890ff" name="Học viên" />
                <Bar dataKey="revenue" fill="#52c41a" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
