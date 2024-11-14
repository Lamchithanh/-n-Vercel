import { Avatar, Spin, Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import styles from "./Testimonials.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

const Testimonials = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize AOS
    AOS.init({ duration: 1000 });

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = courseId
          ? `http://localhost:9000/api/reviews/course/${courseId}`
          : "http://localhost:9000/api/reviews";

        const response = await axios.get(url, {
          params: {
            page: 1,
            limit: 10,
          },
        });

        if (response.data.success) {
          const filteredReviews = response.data.data
            .filter((review) => review.rating > 4)
            .slice(0, 6); // Only show 6 reviews with rating > 4
          setReviews(filteredReviews);
        } else {
          throw new Error(response.data.message || "Failed to fetch reviews");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Có lỗi xảy ra khi tải đánh giá"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    // Cleanup AOS when the component unmounts
    return () => {
      AOS.refresh(); // To refresh the AOS on unmount
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className={styles.testimonials__loading}>
        <Spin tip="Đang tải đánh giá..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Lỗi"
        description={error}
        className={styles.testimonials__error}
        action={
          <button
            onClick={() => window.location.reload()}
            className="ant-btn ant-btn-primary"
          >
            Thử lại
          </button>
        }
      />
    );
  }

  if (!reviews?.length) {
    return (
      <Alert
        type="info"
        message="Chưa có đánh giá"
        description="Khóa học này chưa có đánh giá nào."
        className={styles.testimonials__empty}
      />
    );
  }

  return (
    <div data-aos="fade-up" className={styles.testimonials__form}>
      <h3 className={styles.testimonials__header}>Đánh Giá Của Học Viên</h3>
      <div className={styles.testimonials__container}>
        <h6 data-aos="fade-right" className={styles.testimonials__subtitle}>
          Nhận xét từ các học viên giúp bạn lựa chọn được khóa học phù hợp với
          bản thân
        </h6>
        <div className={styles.testimonials__cards}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className={styles.reviewCard}
              data-aos="fade-up"
            >
              <Avatar
                data-aos="flip-left"
                data-aos-duration="10 00"
                icon={<UserOutlined />}
                src={review.avatar} // Assuming avatarUrl field exists in review
                className={styles.avatar}
              />
              <p data-aos="fade-right" className={styles.reviewText}>
                {review.review_text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Testimonials.propTypes = {
  courseId: PropTypes.number,
};

Testimonials.defaultProps = {
  courseId: null,
};

export default Testimonials;
