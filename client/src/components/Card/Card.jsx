import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import AOS from "aos";
import "aos/dist/aos.css";
import defaultImage from "../../assets/img/sach.png";
import "./Card.scss";
import MacPremium from "../../assets/img/guarantee-removebg-preview.png";

const CourseCard = ({ course, newlyAddedCourses = [] }) => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };
  // định dạng giá tiền
  const formatPrice = (price) => {
    return parseFloat(price)
      .toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      .replace("₫", "VND");
  };

  const isNewCourse = newlyAddedCourses.includes(course.id);
  const isFree = course.price === "0" || course.price === "0.00";

  return (
    <div className="form_card">
      <div
        className="course-card-container"
        onClick={handleCardClick}
        data-aos="fade-up"
      >
        <div className="course-image-wrapper" data-aos="zoom-in">
          <img
            src={course.image || defaultImage}
            alt={course.title}
            className="course-image"
          />
          {!isFree && (
            <span className="hot-label" data-aos="fade-left">
              <img src={MacPremium} style={{ width: 40 }} />
            </span>
          )}
        </div>

        <div className="course-content" data-aos="fade-right">
          <h3 className={`course-title ${isNewCourse ? "new-course" : ""}`}>
            {course.title}
          </h3>

          <div className="course-metadata">
            <span className="course-price">
              {isFree ? "Miễn phí" : formatPrice(course.price)}
            </span>

            <span className="course-level"> {course.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
// ép kiểu
CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    level: PropTypes.string,
  }).isRequired,
  newlyAddedCourses: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
};

export default CourseCard;
