import { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Pagination,
  Badge,
  Drawer,
  List,
  theme,
  Tag,
  Button,
} from "antd";

import {
  LaptopOutlined,
  MenuOutlined,
  NotificationOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./HomePage.scss";
import Loader from "../../context/Loader";
import { fetchCoursesAPI } from "../../../../server/src/Api/courseApi";
import defaultImage from "../../assets/img/sach.png";
import AOS from "aos";
import "aos/dist/aos.css";
import "react-toastify/dist/ReactToastify.css";
import FeaturedCourses from "./FeaturedCourses/FeaturedCourses";
import Testimonials from "./Testimonials/Testimonials";
import LatestBlog from "./LatestBlog/LatestBlog";
import CourseCard from "../../components/Card/Card";
import BackToTop from "./BacktoTop";
import Banner from "../../components/BannerScrollView/BannerScrollView";
import FeaturesSection from "./FeaturesSection";
import Bannertwo from "../../components/BannerScrollView/Bannertwo";
import FeaturesWith from "./FeaturesWith";

const { Header, Content } = Layout;

const filterExpiredNotifications = (notifications) => {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày tính bằng milliseconds
  const currentTime = new Date().getTime();

  return notifications.filter((notification) => {
    const notificationTime = new Date(notification.timestamp).getTime();
    return currentTime - notificationTime < SEVEN_DAYS_MS;
  });
};

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [newlyAddedCourses, setNewlyAddedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pageSize] = useState(6);

  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem("courseNotifications");
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      // Khi khởi tạo, lọc ra các thông báo chưa quá hạn
      return filterExpiredNotifications(parsedNotifications);
    }
    return [];
  });

  useEffect(() => {
    const cleanupNotifications = () => {
      const updatedNotifications = filterExpiredNotifications(notifications);

      if (updatedNotifications.length !== notifications.length) {
        setNotifications(updatedNotifications);
        localStorage.setItem(
          "courseNotifications",
          JSON.stringify(updatedNotifications)
        );

        // Cập nhật lại số lượng thông báo chưa đọc
        const unreadCount = updatedNotifications.filter(
          (notification) => !notification.read
        ).length;
        setUnreadCount(unreadCount);
      }
    };

    // Chạy cleanup ngay khi component mount
    cleanupNotifications();

    // Thiết lập interval để kiểm tra mỗi giờ
    const interval = setInterval(cleanupNotifications, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notifications]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] =
    useState(false);
  const [lastKnownCourses, setLastKnownCourses] = useState(() => {
    // Lấy danh sách khóa học đã biết từ localStorage
    const saved = localStorage.getItem("lastKnownCourses");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi URL thay đổi
    window.scrollTo(0, 0);
  }, [location]);

  AOS.init({
    duration: 500,
    once: true,
    offset: 100,
    easing: "ease-out-cubic",
    mirror: false,
    anchorPlacement: "top-bottom",
  });

  useEffect(() => {
    const shouldShowToast = localStorage.getItem("showSuccessToast");
    if (shouldShowToast) {
      localStorage.removeItem("showSuccessToast"); // Xóa trạng thái sau khi hiển thị để tránh hiển thị lại khi tải lại trang
    }
  }, []);

  // Cập nhật unreadCount khi component mount
  useEffect(() => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );
    setUnreadCount(unreadNotifications.length);
  }, []);

  // Theo dõi khóa học mới
  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const newCourses = await fetchCoursesAPI();
        setCourses(newCourses.sort((a, b) => b.createdAt - a.createdAt));

        // Kiểm tra khóa học mới
        const newAddedCourses = newCourses.filter(
          (course) =>
            !lastKnownCourses.some((prevCourse) => prevCourse.id === course.id)
        );
        setNewlyAddedCourses(newAddedCourses.map((course) => course.id));

        // Kiểm tra khóa học đã bị xóa
        const deletedCourses = lastKnownCourses.filter(
          (prevCourse) =>
            !newCourses.some((course) => course.id === prevCourse.id)
        );

        if (newAddedCourses.length > 0 || deletedCourses.length > 0) {
          let updatedNotifications = [...notifications];

          // Thêm thông báo cho khóa học mới
          if (newAddedCourses.length > 0) {
            const newNotifications = newAddedCourses.map((course) => ({
              id: Date.now() + Math.random(),
              courseId: course.id,
              title: course.title,
              message: `Khóa học mới: ${course.title}`,
              timestamp: new Date().toISOString(),
              read: false,
            }));
            updatedNotifications = [
              ...newNotifications,
              ...updatedNotifications,
            ];
          }

          // Xóa thông báo của các khóa học đã bị xóa
          if (deletedCourses.length > 0) {
            updatedNotifications = updatedNotifications.filter(
              (notification) =>
                !deletedCourses.some(
                  (deletedCourse) => deletedCourse.id === notification.courseId
                )
            );
          }

          updatedNotifications =
            filterExpiredNotifications(updatedNotifications);
          // Cập nhật notifications và localStorage
          setNotifications(updatedNotifications);
          localStorage.setItem(
            "courseNotifications",
            JSON.stringify(updatedNotifications)
          );

          // Cập nhật unreadCount
          const unreadCount = updatedNotifications.filter(
            (notification) => !notification.read
          ).length;
          setUnreadCount(unreadCount);

          // Cập nhật lastKnownCourses
          setLastKnownCourses(newCourses);
          localStorage.setItem("lastKnownCourses", JSON.stringify(newCourses));
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách khóa học:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
    // Kiểm tra khóa học mới mỗi 10 phut
    const interval = setInterval(fetchCoursesData, 100000);

    return () => clearInterval(interval);
  }, [lastKnownCourses, notifications]);

  const handleNotificationClick = () => {
    setIsNotificationDrawerOpen(true);
  };

  const handleNotificationClose = () => {
    setIsNotificationDrawerOpen(false);

    // Đánh dấu tất cả thông báo là đã đọc
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    // Cập nhật state và localStorage
    setNotifications(updatedNotifications);
    localStorage.setItem(
      "courseNotifications",
      JSON.stringify(updatedNotifications)
    );
    setUnreadCount(0);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (path) => {
    if (path === "notifications") {
      handleNotificationClick();
    } else {
      navigate(path);
    }
    if (isMobile) {
      setIsMobileMenuVisible(false);
    }
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items2 = [
    {
      key: "1",
      icon: <LaptopOutlined style={{ fontSize: "18px", color: "#1890ff" }} />,
      label: "Khóa học",
      children: [
        { label: "Khóa học của tôi", path: "/my-courses" },
        { label: "VOUCHER", path: "/Mycoupons" },
      ],
    },
    {
      key: "2",
      icon: <UserOutlined style={{ fontSize: "18px", color: "#52c41a" }} />,
      label: "Giới thiệu",
      children: [{ label: "Mở rộng", path: "/" }],
    },
    {
      key: "3",
      icon: (
        <Badge count={unreadCount} offset={[10, 0]}>
          <NotificationOutlined
            style={{ fontSize: "18px", color: "#fa8c16", alignItems: "center" }}
          />
        </Badge>
      ),
      label: "Thông báo",
      children: [{ label: "Thông báo mới", path: "notifications" }],
    },
    {
      key: "4",
      icon: <TrophyOutlined style={{ fontSize: "18px", color: "#fadb14" }} />,
      label: "Chứng chỉ",
      children: [{ label: "Chứng chỉ", path: "/certificates" }],
    },
  ].map((menu) => ({
    ...menu,
    children: menu.children.map((item, index) => ({
      key: `${menu.key}-${index}`,
      label: item.label,
      onClick: () => handleMenuClick(item.path),
      style: { paddingLeft: 24 }, // Thụt lề để rõ hơn trong menu con
    })),
  }));

  // Render function cho các khóa học
  const renderHomeContent = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Combine newly added courses and current page courses, then sort by createdAt
    const allCourses = [
      ...courses.filter((course) => newlyAddedCourses.includes(course.id)),
      ...courses.slice(startIndex, endIndex),
    ].sort((a, b) => b.createdAt - a.createdAt);

    return (
      <div>
        <h4
          data-aos="fade-right"
          data-aos-delay="100"
          style={{ fontSize: 18, margin: 20 }}
        >
          Tất cả khóa học
        </h4>

        <div className="course-list">
          {allCourses.map((course, index) => (
            <div
              key={course.id}
              data-aos="zoom-in"
              data-aos-delay={index * 100}
              data-aos-duration="300"
            >
              <CourseCard
                course={course}
                newlyAddedCourses={newlyAddedCourses}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;

  return (
    <Layout className="">
      <Header
        style={{
          background: colorBgContainer,
          padding: "0 16px",
          // position: "fixed",
          width: "100%",
          // zindex: 999,
          boxshadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        className="header"
        data-aos="fade-down"
        data-aos-duration="500"
      >
        <div className="header-content">
          <div className="demo-logo" />
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setIsMobileMenuVisible(true)}
              className="mobile-menu-button"
            />
          ) : (
            <Menu
              mode="horizontal"
              defaultSelectedKeys={["1"]}
              items={items2}
              className="header-menu"
            />
          )}
        </div>
      </Header>
      <div className="bannerone_homepage">
        {" "}
        <Banner />
      </div>
      <div
        className="homepage_FeaturedCourses"
        style={{ height: "120vh" }}
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <FeaturedCourses
          courses={courses
            .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
            .slice(0, 8)
            .map((course) => ({
              ...course,
              image: course.image || defaultImage,
              rating: course.rating || 4.5,
              reviewCount: course.reviewCount || 0,
              instructor: course.instructor || "Giảng viên",
            }))}
        />
      </div>
      <div className="">
        {" "}
        <FeaturesSection />
      </div>
      <div
        data-aos="fade-up"
        data-aos-delay="300"
        style={{ width: "100%", display: "grid" }}
      >
        <Testimonials />
      </div>
      <div className="bannertwo_homepage">
        {" "}
        <Bannertwo />
      </div>

      <Content className="content_homepage">
        <Breadcrumb className="breadcrumb" items={[{ title: "" }]} />

        <p>
          <div className="content">
            {location.pathname === "/allcourses" ? (
              renderHomeContent()
            ) : (
              <Outlet />
            )}
            <div data-aos="fade-up" data-aos-delay="300">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={courses.length}
                onChange={(page) => setCurrentPage(page)}
                style={{
                  marginTop: "16px",
                  textAlign: "center",
                  color: "#E7005E",
                }}
              />
            </div>
          </div>
        </p>
      </Content>
      <div data-aos="fade-up" data-aos-delay="400">
        <FeaturesWith />
      </div>
      <div data-aos="fade-up" data-aos-delay="400">
        <LatestBlog />
      </div>

      <BackToTop />

      {/* Drawers */}
      <Drawer
        title="Danh Mục"
        placement="left"
        onClose={() => setIsMobileMenuVisible(false)}
        open={isMobileMenuVisible}
        className="mobile-menu-drawer"
        width={300}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={items2}
          className="mobile-menu"
        />
      </Drawer>

      <Drawer
        className="Drawer_homepage"
        title="Thông báo mới"
        placement="right"
        onClose={handleNotificationClose}
        open={isNotificationDrawerOpen}
        width={320}
      >
        <List
          dataSource={notifications}
          // Trong phần render của List trong Drawer
          renderItem={(notification) => (
            <List.Item
              style={{
                cursor: "pointer",
                transition: "background-color 0.3s",
                padding: "12px",
                backgroundColor: notification.important
                  ? "#fff7e6"
                  : "transparent",
              }}
              className="drawer_homepage hover:bg-gray-100"
            >
              <List.Item.Meta
                onClick={() => {
                  if (notification.type === "certificate") {
                    navigate("/certificates");
                  } else {
                    navigate(`/courses/${notification.courseId}`);
                  }
                  handleNotificationClose();
                }}
                title={
                  <span style={{ color: notification.read ? "#666" : "#000" }}>
                    {notification.title}
                    {!notification.read && (
                      <Tag color="red" style={{ marginRight: "8px" }}>
                        New
                      </Tag>
                    )}
                    {notification.important && (
                      <Tag color="gold" style={{ marginRight: "8px" }}>
                        Important
                      </Tag>
                    )}
                  </span>
                }
                description={notification.message}
              />
            </List.Item>
          )}
          locale={{ emptyText: "Không có thông báo mới" }}
        />
      </Drawer>
      {/* <RandomCoupon /> */}
    </Layout>
  );
};

export default HomePage;
