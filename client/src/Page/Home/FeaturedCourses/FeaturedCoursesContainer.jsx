import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import CourseCard from "../../../components/Card/Card";
import styles from "./FeaturedCourses.module.scss";

const FeaturedCoursesContainer = ({ courses = [], maxDisplayCount = 6 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const topEnrolledCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return [...courses]
      .sort((a, b) => b.enrollment_count - a.enrollment_count)
      .slice(0, maxDisplayCount)
      .map((course) => ({
        ...course,
        // Đảm bảo price luôn là string và format đúng
        price: course.price?.toString() || "0",
      }));
  }, [courses, maxDisplayCount]);

  useEffect(() => {
    setIsLoading(true);
    if (courses.length > 0) {
      setIsLoading(false);
      setError(null);
    } else {
      setError("Không có dữ liệu khóa học");
      setIsLoading(false);
    }
  }, [courses]);

  if (isLoading) {
    return <div>Đang tải khóa học...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.featuredCourses__container}>
      {topEnrolledCourses.length > 0 ? (
        topEnrolledCourses.map((course) => (
          <div key={course.id} className={styles.featuredCourses__cardWrapper}>
            <CourseCard course={course} />
            <div
              style={{
                background: "#fff2b2",
                padding: 10,
                borderRadius: 10,
                color: "#db7c26",
                fontWeight: 600,
                display: "inline-block",
              }}
              className={styles.featuredCourses__enrollmentCount}
            >
              + {course.enrollment_count?.toLocaleString() || 0} Hoc viên
            </div>
          </div>
        ))
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
