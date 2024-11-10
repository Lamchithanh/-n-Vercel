import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "./MyCourses.module.scss";
import defaultImage from "../../assets/img/sach.png";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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
                style={{ width: `${course.progress?.percentage || 0}%` }}
              />
            </div>
            <div className={styles["featuredCourses__progress-text"]}>
              <span>Tiến độ</span>
              <span>{course.progress?.percentage || 0}%</span>
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
    progress: PropTypes.shape({
      percentage: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const courseGridRef = useRef(null);
  const scrollTimeout = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
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

        const response = await axios.get(
          `http://localhost:9000/api/my-courses/${user.id}`
        );

        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);

        if (err.response?.status === 403) {
          setError("Bạn không có quyền truy cập khóa học này");
        } else if (err.name === "SyntaxError") {
          setError("Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.");
        } else {
          setError("Có lỗi xảy ra khi tải khóa học. Vui lòng thử lại sau.");
        }
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  // Xử lý cuộn mượt bằng chuột
  useEffect(() => {
    const handleWheel = (e) => {
      if (courseGridRef.current) {
        e.preventDefault();
        const scrollSpeed = 80; // Giảm tốc độ cuộn
        const delta = (e.deltaY * scrollSpeed) / 100;

        courseGridRef.current.scrollLeft += delta;
        setIsScrolling(true);

        // Reset scrolling state after scrolling ends
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
    };

    const currentRef = courseGridRef.current;
    if (currentRef) {
      currentRef.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleWheel);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Xử lý kéo thả bằng chuột với độ nhạy được điều chỉnh
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
      const sensitivity = 1.5; // Tăng độ nhạy khi kéo
      const walk = (x - startX) * sensitivity;
      courseGridRef.current.scrollLeft = scrollLeft - walk;
      setIsScrolling(true);
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
        <h1 className="text-2xl font-bold">
          Khóa học của tôi ({courses.length})
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500  rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Khám phá thêm khóa học
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Xem danh sách khóa học
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden">
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
              <CourseCard key={course.id} course={course} />
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
