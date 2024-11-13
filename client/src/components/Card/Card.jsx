import { useNavigate } from "react-router-dom";
import defaultImage from "../../assets/img/sach.png";
import "./Card.scss";
import MacPremium from "../../assets/img/guarantee.png";
const CourseCard = ({ course, newlyAddedCourses = [] }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const isNewCourse = newlyAddedCourses.includes(course.id);
  const isFree = course.price === "0" || course.price === "0.00";

  return (
    <div className="course-card-container" onClick={handleCardClick}>
      <div className="course-image-wrapper">
        <img
          src={course.image || defaultImage}
          alt={course.title}
          className="course-image"
        />
        {!isFree && (
          <span className="hot-label">
            <img src={MacPremium} style={{ width: 40 }} />
          </span>
        )}
      </div>

      <div className="course-content">
        <h3 className={`course-title ${isNewCourse ? "new-course" : ""}`}>
          {course.title}
        </h3>

        <div className="course-metadata">
          <span className="course-price">
            {course.price === "0" || course.price === "0.00"
              ? "Miễn phí"
              : `${course.price} vnd`}
          </span>

          <span className="course-level"> {course.level}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
