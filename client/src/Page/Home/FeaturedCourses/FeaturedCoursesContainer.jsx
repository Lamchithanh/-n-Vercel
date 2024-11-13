import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../../assets/img/sach.png";
import styles from "./FeaturedCourses.module.scss";

const FeaturedCoursesContainer = ({ courses = [], maxDisplayCount = 6 }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sử dụng useMemo để tối ưu hiệu suất khi lọc và sắp xếp khóa học
  const topEnrolledCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return [...courses]
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, maxDisplayCount); // Hiển thị tối đa maxDisplayCount khóa học
  }, [courses, maxDisplayCount]);

  useEffect(() => {
    // Simulating loading state
    setIsLoading(true);
    if (courses.length > 0) {
      setIsLoading(false);
      setError(null);
    } else {
      setError("Không có dữ liệu khóa học");
      setIsLoading(false);
    }
  }, [courses]);

  const renderCourseCard = (course) => (
    <Card
      key={course.id}
      onClick={() => navigate(`/courses/${course.id}`)}
      className={styles.featuredCourses__card}
      cover={
        <div className={styles.featuredCourses__imageWrapper}>
          <img
            alt={course.title}
            src={course.image || defaultImage}
            className={styles.featuredCourses__image}
            onError={(e) => {
              e.target.src = defaultImage;
              e.target.onerror = null;
            }}
          />
        </div>
      }
      hoverable
    >
      <div className={styles.featuredCourses__content}>
        <div className={styles.featuredCourses__header}>
          {course.price && parseFloat(course.price) > 0 && (
            <span className={styles.featuredCourses__crown}>🔥</span>
          )}
          <h3 className={styles.featuredCourses__title}>{course.title}</h3>
        </div>

        <div className={styles.featuredCourses__footer}>
          <span className={styles.featuredCourses__level}>
            {course.level || "Cơ bản"}
          </span>
          <span className={styles.featuredCourses__price}>
            {!course.price || parseFloat(course.price) === 0
              ? "Miễn phí"
              : `${Number(course.price).toLocaleString()} VND`}
          </span>
          <span className={styles.featuredCourses__level}>
            Đăng ký: {course.enrollment_count?.toLocaleString() || 0}
          </span>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return <div>Đang tải khóa học...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.featuredCourses__container}>
      {topEnrolledCourses.length > 0 ? (
        topEnrolledCourses.map(renderCourseCard)
      ) : (
        <div>Không có khóa học nổi bật.</div>
      )}
    </div>
  );
};

FeaturedCoursesContainer.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      image: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      level: PropTypes.string,
      enrollment_count: PropTypes.number,
    })
  ),
  maxDisplayCount: PropTypes.number,
};

export default FeaturedCoursesContainer;
