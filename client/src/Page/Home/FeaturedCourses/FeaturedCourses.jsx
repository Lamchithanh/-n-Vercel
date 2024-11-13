import { useState, useEffect } from "react";
import { message } from "antd";
import FeaturedCoursesContainer from "./FeaturedCoursesContainer";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:9000/api/top-enrolled-courses"
        );

        const data = await response.json();

        if (response.ok) {
          // Kiểm tra xem mã trạng thái HTTP có phải là 2xx không
          setCourses(data.courses);
        } else {
          message.error(
            data.message || "Không thể tải danh sách khóa học nổi bật"
          );
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        message.error("Đã xảy ra lỗi khi tải khóa học");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCourses();
  }, []);

  return (
    <div>
      <h4 style={{ margin: "20px 50px" }}>Khóa Học Nổi Bật</h4>
      <FeaturedCoursesContainer courses={courses} isLoading={isLoading} />
    </div>
  );
};

export default FeaturedCourses;
