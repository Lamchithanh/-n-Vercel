import PropTypes from "prop-types";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../../assets/img/sach.png";
import styles from "./FeaturedCourses.module.scss";

const FeaturedCourses = ({ courses = [] }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.featuredCourses__container}>
      {courses.map((course) => (
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
              />
            </div>
          }
          hoverable
        >
          <div className={styles.featuredCourses__content}>
            <div className={styles.featuredCourses__header}>
              {course.price &&
                course.price !== "0" &&
                course.price !== "0.00" && (
                  <img
                    src="https://img.icons8.com/external-basicons-color-edtgraphics/50/external-Crown-crowns-basicons-color-edtgraphics-6.png"
                    alt="crown"
                    className={styles.featuredCourses__crown}
                  />
                )}
              <h3 className={styles.featuredCourses__title}>{course.title}</h3>
            </div>

            <div className={styles.featuredCourses__footer}>
              <span className={styles.featuredCourses__level}>
                Level: {course.level}
              </span>
              <span className={styles.featuredCourses__price}>
                {course.price === "0" || course.price === "0.00"
                  ? "Miễn phí"
                  : `${course.price} vnd`}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

FeaturedCourses.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      image: PropTypes.string,
      rating: PropTypes.number,
      reviewCount: PropTypes.number,
      instructor: PropTypes.string,
      price: PropTypes.number,
      level: PropTypes.string,
    })
  ),
};

export default FeaturedCourses;
