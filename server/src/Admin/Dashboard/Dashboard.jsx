import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "antd";
import "aos/dist/aos.css";
import AOS from "aos";
import { fetchdashboardAPI } from "../../Api/IntroduceAPI.js";
import "./Dashboard.scss";

const { Title } = Typography;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await fetchdashboardAPI(token);
        console.log("Dữ liệu Dashboard:", data);
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        console.error("Lỗi khi lấy dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="Dashboard_layout--loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="Dashboard_layout--error">
        <Typography.Text type="danger">
          Lỗi: {error}. Vui lòng thử lại sau.
        </Typography.Text>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="Dashboard_layout--noData">
        <Typography.Text type="danger">
          Không có dữ liệu. Vui lòng thử lại sau.
        </Typography.Text>
      </div>
    );
  }

  const { totals, monthlyData, topCourses } = dashboardData;

  return (
    <div className="Dashboard_layout">
      <Title level={2} data-aos="fade-right" className="Dashboard_title">
        Dashboard
      </Title>

      {/* Cards Section */}
      <Row gutter={[16, 16]} className="Dashboard_cards">
        {[
          { title: "Người dùng", value: totals.users },
          { title: "Khóa học", value: totals.courses },
          {
            title: "Chứng chỉ",
            value: (
              <>
                <div className="Dashboard_cardValue">
                  {totals.certificates
                    ? totals.certificates.toLocaleString()
                    : "0"}{" "}
                  / {totals.users}
                </div>
                <Progress
                  percent={(totals.certificates / totals.users) * 100}
                  strokeColor="#fa541c"
                  status="active"
                  showInfo={false}
                />
              </>
            ),
          },
          {
            title: "Doanh thu",
            value: `${totals.revenue.toLocaleString()} VND`,
          },
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card data-aos="fade-up" className="Dashboard_card">
              <div className="Dashboard_cardContent">
                <div className="Dashboard_cardValue">{item.value}</div>
                <div className="Dashboard_cardTitle">{item.title}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} className="Dashboard_charts">
        <Col xs={24} lg={12}>
          <Card
            title={
              <span className="custom-card-title">Thống kê hằng tháng</span>
            }
            data-aos="fade-up"
            className="Dashboard_chartCard"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#fa541c" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<span className="custom-card-title">Khóa học phổ biến</span>}
            data-aos="fade-up"
            className="Dashboard_chartCard"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={topCourses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#1890ff"
                  name="Sinh viên"
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
      </Row>
    </div>
  );
};

export default Dashboard;
