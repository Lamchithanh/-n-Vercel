import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "./MyCourses.module.scss";
import defaultImage from "../../assets/img/sach.png";
import { getProgressAPI } from "../../../../server/src/Api/courseApi";
import { Button } from "antd";

const CourseCard = ({ course, progress }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getProgressColor = (percent) => {
    if (percent >= 100) return "#52c41a";
    if (percent >= 75) return "#1890ff";
    if (percent >= 50) return "#722ed1";
    return "#108ee9";
  };

  return (
    <div
      className={`${styles.featuredCourses__card} ${
        isHovered ? styles.cardHovered : ""
      }`}
      onClick={() => navigate(`/courses/${course.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.featuredCourses__imageWrapper}>
        <img
          src={course.image || defaultImage}
          alt={course.title}
          className={`${styles.featuredCourses__image} ${
            isHovered ? styles.imageHovered : ""
          }`}
        />
      </div>
      <div className={styles.featuredCourses__content}>
        <div className={styles.featuredCourses__header}>
          <h3 className={styles.featuredCourses__title}>{course.title}</h3>
        </div>
        <p className={styles.featuredCourses_description}>
          {course.description}
        </p>
        <div className={styles.featuredCourses__footer}>
          <span className={styles.featuredCourses__level}>{course.level}</span>
          <div className={styles.featuredCourses__progress}>
            <div className={styles["featuredCourses__progress-container"]}>
              <div
                className={styles["featuredCourses__progress-bar"]}
                style={{
                  width: `${progress?.percentage || 0}%`,
                  backgroundColor: getProgressColor(progress?.percentage || 0),
                }}
              />
            </div>
            <div className={styles["featuredCourses__progress-text"]}>
              <span>Tiến độ</span>
              <span>{progress?.percentage?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    level: PropTypes.string.isRequired,
  }).isRequired,
  progress: PropTypes.shape({
    percentage: PropTypes.number.isRequired,
    watchedLessons: PropTypes.array.isRequired,
    totalLessons: PropTypes.number.isRequired,
  }),
};

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const courseGridRef = useRef(null);
  const navigate = useNavigate();

  // Fetch progress for a single course
  const fetchCourseProgress = async (userId, courseId, modules) => {
    try {
      const progressData = await getProgressAPI(userId, courseId);

      const watched = progressData.filter((p) => p.watched);
      const uniqueWatchedLessons = [...new Set(watched.map((p) => p.lessonId))];
      const totalLessons = modules.reduce(
        (total, module) => total + module.lessons.length,
        0
      );

      const progressPercentage =
        (uniqueWatchedLessons.length / totalLessons) * 100;

      return {
        percentage: progressPercentage,
        watchedLessons: uniqueWatchedLessons,
        totalLessons,
      };
    } catch (error) {
      console.error(`Error fetching progress for course ${courseId}:`, error);
      return {
        percentage: 0,
        watchedLessons: [],
        totalLessons: 0,
      };
    }
  };

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      try {
        const userString = localStorage.getItem("user");

        if (!userString) {
          console.log("Không tìm thấy thông tin user trong localStorage");
          navigate("/login", { replace: true, state: { from: "/my-courses" } });
          return;
        }

        const user = JSON.parse(userString);

        if (!user.id) {
          console.log("Không tìm thấy id trong thông tin user");
          navigate("/login", { replace: true, state: { from: "/my-courses" } });
          return;
        }

        const coursesResponse = await axios.get(
          `http://localhost:9000/api/my-courses/${user.id}`
        );

        const coursesData = coursesResponse.data;
        setCourses(coursesData);

        // Fetch progress for each course using the updated fetchCourseProgress function
        const progressPromises = coursesData.map(async (course) => {
          const progress = await fetchCourseProgress(
            user.id,
            course.id,
            course.modules
          );
          return { [course.id]: progress };
        });

        const progressResults = await Promise.all(progressPromises);
        const progressData = progressResults.reduce(
          (acc, curr) => ({
            ...acc,
            ...curr,
          }),
          {}
        );

        setCourseProgress(progressData);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(
          err.response?.status === 403
            ? "Bạn không có quyền truy cập khóa học này"
            : err.name === "SyntaxError"
            ? "Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại."
            : "Có lỗi xảy ra khi tải khóa học. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };

    fetchCoursesAndProgress();
  }, [navigate]);

  // Rest of the component remains the same...
  const checkScrollButtons = () => {
    if (courseGridRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = courseGridRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleScroll = (direction) => {
    if (courseGridRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? courseGridRef.current.scrollLeft - scrollAmount
          : courseGridRef.current.scrollLeft + scrollAmount;

      courseGridRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 150);
    }
  };

  // Mouse event handlers remain the same...
  const handleMouseDown = (e) => {
    if (courseGridRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - courseGridRef.current.offsetLeft);
      setScrollLeft(courseGridRef.current.scrollLeft);
      courseGridRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    if (courseGridRef.current) {
      const x = e.pageX - courseGridRef.current.offsetLeft;
      const sensitivity = 1.5;
      const walk = (x - startX) * sensitivity;
      courseGridRef.current.scrollLeft = scrollLeft - walk;
      setIsScrolling(true);
      checkScrollButtons();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (courseGridRef.current) {
      courseGridRef.current.style.cursor = "grab";
    }
    setTimeout(() => setIsScrolling(false), 150);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (courseGridRef.current) {
      courseGridRef.current.style.cursor = "grab";
    }
    setTimeout(() => setIsScrolling(false), 150);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          className="btn-back"
          onClick={() => navigate(-1)}
          style={{ margin: 10 }}
        >
          ← Quay lại
        </Button>
        <h1 className="text-2xl font-bold">
          Khóa học của tôi ({courses.length})
        </h1>
        <button
          onClick={() => navigate("courses")}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Khám phá thêm khóa học
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào.</p>
          <button
            onClick={() => navigate("/allcourses")}
            className="px-4 py-2 bg-blue-500  rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Xem danh sách khóa học
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden">
          <button
            onClick={() => handleScroll("left")}
            className={`absolute left-0 top-1/2 z-20 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg transition-opacity duration-300 hover:bg-gray-100 ${
              showLeftButton ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <button
            onClick={() => handleScroll("right")}
            className={`absolute right-0 top-1/2 z-20 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg transition-opacity duration-300 hover:bg-gray-100 ${
              showRightButton ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          <div
            className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-48 transition-opacity duration-300 ${
              isScrolling ? "opacity-90" : "opacity-70"
            }`}
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            ref={courseGridRef}
            className={`${styles.courseGrid} cursor-grab active:cursor-grabbing`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={courseProgress[course.id]}
              />
            ))}
          </div>
          <div
            className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-48 transition-opacity duration-300 ${
              isScrolling ? "opacity-90" : "opacity-70"
            }`}
            style={{
              background:
                "linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MyCourses;
