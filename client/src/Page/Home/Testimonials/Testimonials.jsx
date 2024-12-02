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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
    });
    return () => AOS.refresh();
  }, []);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const url = courseId
        ? `http://localhost:9000/api/reviews/course/${courseId}`
        : "http://localhost:9000/api/reviews";

      const response = await axios.get(url, {
        params: {
          page,
          limit: 6,
        },
      });

      if (response.data.success) {
        const filteredReviews = response.data.data
          .filter((review) => review.rating > 4)
          .slice(0, 6);

        // If it's the first page, replace reviews. Otherwise, append.
        setReviews((prevReviews) =>
          page === 1 ? filteredReviews : [...prevReviews, ...filteredReviews]
        );

        // Check if there are more reviews to load
        setHasMore(filteredReviews.length === 6);
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

  useEffect(() => {
    fetchReviews();

    return () => {
      AOS.refresh();
    };
  }, [courseId]);

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    fetchReviews(currentPage + 1);
  };

  if (loading && reviews.length === 0) {
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
          Nhận xét từ các học viên giúp bạn lựa chọn khóa học phù hợp
        </h6>
        <div className={styles.testimonials__cards}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className={styles.reviewCard}
              data-aos="fade-up"
            >
              <div className={styles.reviewCardHeader}>
                <Avatar
                  data-aos="flip-left"
                  src={review.avatar}
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />
                {/* <div className={styles.reviewRating}>
                  {[...Array(review.rating)].map((_, index) => (
                    <StarFilled key={index} style={{ color: "#ffc107" }} />
                  ))}
                </div> */}
              </div>
              <p data-aos="fade-right" className={styles.reviewText}>
                {review.review_text}
              </p>
            </div>
          ))}
        </div>

        {/* {hasMore && (
          <div className={styles.loadMoreContainer}>
            <button
              onClick={handleLoadMore}
              className={styles.loadMoreButton}
              disabled={loading}
            ></button>
          </div>
        )} */}
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
