import { useState, useEffect } from "react";
import { Row, Button, Spin, Empty, Tag } from "antd";
import {
  BookOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy userId từ localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setError("Vui lòng đăng nhập để xem khóa học của bạn");
          return;
        }

        const response = await fetch(
          `http://localhost:9000/api/enrollments/my-courses`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Không thể tải danh sách khóa học"
          );
        }

        const data = await response.json();

        // Lọc khóa học dựa trên userId
        const userCourses = data.filter((course) => course.userId === userId);
        setEnrollments(userCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [navigate]);

  const getCourseProgress = (enrollment) => {
    const progress = enrollment.progress?.percentage || 0;

    if (enrollment.completed_at) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Đã hoàn thành
        </Tag>
      );
    }

    if (progress === 100) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Hoàn thành
        </Tag>
      );
    }

    return (
      <Tag color="processing" icon={<ClockCircleOutlined />}>
        {progress}% hoàn thành
      </Tag>
    );
  };

  const renderCourseCard = (enrollment) => (
    <div key={enrollment.id} className="course-card">
      <h3>{enrollment.title}</h3>
      <p>{enrollment.description}</p>
      {getCourseProgress(enrollment)}
    </div>
  );

  // Rest of your component code remains the same...

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        <Button
          type="primary"
          onClick={() => navigate("/login", { state: { from: "/my-courses" } })}
          className="mt-4"
        >
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <BookOutlined className="mr-2" /> Khóa học của tôi
          <span className="ml-2 text-gray-500 text-base">
            ({enrollments.length} khóa học)
          </span>
        </h2>
        <Button type="primary" onClick={() => navigate("/courses")}>
          Khám phá thêm khóa học
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <Empty
          description="Bạn chưa đăng ký khóa học nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/courses")}>
            Khám phá khóa học
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>{enrollments.map(renderCourseCard)}</Row>
      )}
    </div>
  );
};

export default MyCourses;
