import { UserOutlined } from "@ant-design/icons";
import { Avatar, Rate, Alert, Spin } from "antd";
import PropTypes from "prop-types";
import styles from "./Testimonials.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";

const Testimonials = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = courseId
          ? `http://localhost:9000/api/reviews/course/${courseId}`
          : "http://localhost:9000/api/reviews";

        const response = await axios.get(url, {
          params: {
            page: pagination.current,
            limit: pagination.pageSize,
          },
        });

        if (response.data.success) {
          setReviews(response.data.data);
          setPagination((prev) => ({
            ...prev,
            total: response.data.pagination.total,
          }));
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
  }, [courseId, pagination.current, pagination.pageSize]);

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
            onClick={() => {
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
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
    <div className={styles.testimonials__container}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className={styles.testimonials__title}>Đánh Giá Của Học Viên</h2>
      </div>

      <div className={styles.testimonials__track}>
        <div className={styles.testimonials__slider}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.testimonials__card}>
              <div
                style={{ display: "flex" }}
                className={styles.testimonials__header}
              >
                <Avatar
                  size={44}
                  icon={<UserOutlined />}
                  src={review.avatar}
                  className={styles.testimonials__avatar}
                />
                <div
                  style={{
                    display: "grid",
                    justifyItems: "start",
                    marginLeft: 10,
                  }}
                >
                  <h3 className={styles.testimonials__name}>
                    {review.full_name}
                  </h3>
                  <div className={styles.testimonials__rating}>
                    <Rate disabled defaultValue={review.rating} />
                  </div>
                </div>
              </div>
              <p className={styles.testimonials__content}>
                {review.review_text}
              </p>
              <div className={styles.testimonials__date}>
                {new Date(review.created_at).toLocaleDateString("vi-VN")}
              </div>
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
