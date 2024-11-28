import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Rate, Button, Modal, Form, Input, List, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { confirm } = Modal;

const CourseReview = ({ courseId, isEnrolled }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (courseId) {
      fetchReviews();
      fetchStats();
    }
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/courses/${courseId}/reviews`
      );
      const data = await response.json();
      setReviews(data.reviews);
    } catch {
      message.error("Không thể tải đánh giá");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:9000/api/courses/${courseId}/review-stats`
      );
      const data = await response.json();
      setStats(data);
    } catch {
      message.error("Không thể tải thống kê");
    }
  };

  const handleSubmit = async (values) => {
    // Kiểm tra nếu người dùng chưa đăng ký thì ngăn không cho gửi đánh giá
    if (!isEnrolled) {
      message.error("Bạn phải đăng ký khóa học trước khi có thể đánh giá.");
      return;
    }

    setLoading(true);
    try {
      const url = editingReview
        ? `http://localhost:9000/api/reviews/${editingReview.id}`
        : `http://localhost:9000/api/courses/${courseId}/reviews`;

      const method = editingReview ? "put" : "post";

      await axios[method](url, {
        userId: user.id,
        rating: values.rating,
        reviewText: values.reviewText,
      });

      message.success(
        editingReview ? "Đã cập nhật đánh giá" : "Đã thêm đánh giá"
      );
      setIsModalVisible(false);
      form.resetFields();
      setEditingReview(null);
      fetchReviews();
      fetchStats();
    } catch (error) {
      message.error("Không thể lưu đánh giá");
      console.error(error); // Thêm để debug
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reviewId) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa đánh giá này?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:9000/api/reviews/${reviewId}`);
          message.success("Đã xóa đánh giá");
          fetchReviews();
          fetchStats();
        } catch (error) {
          message.error("Không thể xóa đánh giá");
          console.error(error); // Thêm để debug
        }
      },
    });
  };

  const renderStats = () => {
    if (!stats) return null;

    const averageRating = Number(stats.averageRating || 0).toFixed(1);

    return (
      <Card className="mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div className="flex items-center gap-4">
          <Rate
            style={{ fontSize: 15 }}
            disabled
            allowHalf
            value={stats.averageRating}
          />
          <span> {averageRating} </span>
          <strong className="text-gray-500">
            ({stats.totalReviews} đánh giá)
          </strong>
        </div>
      </Card>
    );
  };

  const renderActions = (review) => {
    if (user?.id !== review.user_id) return [];

    return [
      <Button
        key="edit"
        icon={<EditOutlined />}
        onClick={() => {
          setEditingReview(review);
          form.setFieldsValue({
            rating: review.rating,
            reviewText: review.review_text,
          });
          setIsModalVisible(true);
        }}
      />,
      <Button
        key="delete"
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(review.id)}
      />,
    ];
  };

  return (
    <div>
      {renderStats()}

      {isEnrolled ? (
        <button
          style={{ background: "#e7005e", color: "#fff" }}
          onClick={() => setIsModalVisible(true)}
          className="mb-4"
        >
          Viết đánh giá
        </button>
      ) : (
        <p style={{ color: "#f05a28" }}>
          Bạn cần đăng ký khóa học trước khi có thể đánh giá.
        </p>
      )}

      <List
        itemLayout="vertical"
        dataSource={reviews}
        renderItem={(review) => (
          <List.Item
            key={review.id}
            actions={renderActions(review)}
            style={{
              marginTop: 5,
              padding: 5,
              borderRadius: 8,
            }}
          >
            <List.Item.Meta
              title={<span>{review.user_name}</span>}
              description={
                <div>
                  <Rate
                    style={{ fontSize: 15 }}
                    disabled
                    value={review.rating}
                  />
                  <span> </span>
                  <span className="ml-2 text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              }
            />
            <span style={{ color: "#666" }}>{review.review_text}</span>
          </List.Item>
        )}
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: 10,
          background: "#fff",
          borderRadius: 8,
        }}
      />

      <Modal
        title={editingReview ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingReview(null);
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
            initialValue={5}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="reviewText"
            label="Nhận xét"
            rules={[
              { required: true, message: "Vui lòng nhập nhận xét" },
              { min: 2, message: "Nội dung quá ngắn" },
              { max: 1000, message: "Nội dung quá dài" },
            ]}
          >
            <TextArea rows={4} maxLength={1000} />
          </Form.Item>
          <Form.Item>
            <button
              style={{ background: "#e7005e", color: "#fff" }}
              loading={loading}
            >
              {editingReview ? "Cập nhật" : "Gửi đánh giá"}
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

CourseReview.propTypes = {
  courseId: PropTypes.string.isRequired,
  isEnrolled: PropTypes.bool,
};

CourseReview.defaultProps = {
  isEnrolled: false,
};

export default CourseReview;
