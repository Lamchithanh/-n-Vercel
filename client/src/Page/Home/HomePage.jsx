import { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  theme,
  Card,
  message,
  Pagination,
} from "antd";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./HomePage.scss";
import Loader from "../../context/Loader";
import { fetchCoursesAPI } from "../../../../server/src/Api/courseApi"; // Đường dẫn tới file API
import defaultImage from "../../assets/img/sach.png"; // Đường dẫn tới ảnh mặc định

const { Header, Content } = Layout;

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8); // Số thẻ trên mỗi trang
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const courses = await fetchCoursesAPI();
        setCourses(courses);
      } catch (err) {
        console.error("Lỗi khi tải danh sách khóa học:", err);
        setError("Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.");
        message.error("Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const items2 = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Tài khoản",
      children: [{ label: "Thông tin cá nhân", path: "user-info" }],
    },
    {
      key: "2",
      icon: <LaptopOutlined />,
      label: "Khóa học",
      children: [
        { label: "Khóa học của tôi", path: "my-courses" },
        { label: "Khóa học mới", path: "/" },
        { label: "Khóa học yêu thích", path: "/" },
      ],
    },
    {
      key: "3",
      icon: <NotificationOutlined />,
      label: "Thông báo",
      children: [
        { label: "Thông báo mới", path: "/" },
        { label: "Thông báo quan trọng", path: "/" },
        { label: "Thông báo khác", path: "/" },
      ],
    },
  ].map((menu) => ({
    ...menu,
    children: menu.children.map((item, index) => ({
      key: `${menu.key}-${index}`,
      label: item.label,
      onClick: () => handleMenuClick(item.path),
    })),
  }));

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const renderHomeContent = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentCourses = courses.slice(startIndex, endIndex);

    return (
      <div className="course-list ">
        {currentCourses.map((course) => (
          <Card
            key={course.id}
            onClick={() => navigate(`/courses/${course.id}`)}
            cover={
              <img
                alt={course.title}
                src={course.image || defaultImage}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            }
            style={{ marginBottom: "16px", cursor: "pointer" }}
          >
            <h5>
              {course.title}
              {course.price &&
                course.price !== "0" &&
                course.price !== "0.00" && <span> (PRO)</span>}
            </h5>
            <p>{course.description}</p>
            <p>
              Price:{" "}
              {course.price === "0" || course.price === "0.00"
                ? "Miễn phí"
                : `${course.price} vnd`}
            </p>
            <p>Level: {course.level}</p>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;

  return (
    <Layout className="">
      {/* Header với Menu ngang */}
      <Header style={{ background: colorBgContainer }}>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={items2}
          className="header-menu"
        />
      </Header>

      <Content style={{ padding: "0 24px 24px" }}>
        <Breadcrumb className="breadcrumb" items={[{ title: "Trang chủ" }]} />
        <div className="content">
          {location.pathname === "/" ? renderHomeContent() : <Outlet />}
          {/* Pagination */}
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={courses.length}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: "16px", textAlign: "center" }}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
