import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Rate,
  Button,
  Modal,
  Form,
  Input,
  List,
  Space,
  Typography,
  message,
  Tooltip,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  fetchCourseReviews,
  addCourseReview,
  updateCourseReview,
  deleteCourseReview,
  getCourseReviewStats,
  hasUserReviewedCourse,
} from "../../../../server/src/Api/courseReviewsApi";

const { TextArea } = Input;
const { Text, Title } = Typography;

const CourseReviews = ({ courseId, isEnrolled }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadReviews();
    loadStats();
    if (user) {
      checkUserReview();
    }
  }, [courseId]);

  const loadReviews = async () => {
    try {
      const data = await fetchCourseReviews(courseId);
      setReviews(data);
    } catch {
      message.error("Không thể tải đánh giá khóa học");
    }
  };

  const loadStats = async () => {
    try {
      const data = await getCourseReviewStats(courseId);
      setStats(data);
    } catch {
      message.error("Không thể tải thống kê đánh giá");
    }
  };

  const checkUserReview = async () => {
    try {
      const hasReviewed = await hasUserReviewedCourse(courseId);
      setUserHasReviewed(hasReviewed);
    } catch {
      console.error("Lỗi kiểm tra trạng thái đánh giá:");
    }
  };

  const handleAddReview = () => {
    setEditingReview(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    form.setFieldsValue({
      rating: review.rating,
      reviewText: review.review_text,
    });
    setIsModalVisible(true);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteCourseReview(reviewId);
      message.success("Xóa đánh giá thành công");
      loadReviews();
      loadStats();
      setUserHasReviewed(false);
    } catch {
      message.error("Không thể xóa đánh giá");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingReview) {
        await updateCourseReview(editingReview.id, values);
        message.success("Cập nhật đánh giá thành công");
      } else {
        await addCourseReview({
          courseId,
          rating: values.rating,
          reviewText: values.reviewText,
        });
        message.success("Thêm đánh giá thành công");
      }
      setIsModalVisible(false);
      loadReviews();
      loadStats();
      setUserHasReviewed(true);
    } catch (error) {
      console.error("Lỗi khi lưu đánh giá:", error);
      message.error("Không thể lưu đánh giá");
    } finally {
      setLoading(false); // Đảm bảo loading được thiết lập lại
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Card className="mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Title level={4}>Đánh giá trung bình</Title>
          <Space align="center">
            <Rate disabled allowHalf value={stats.averageRating} />
            <Text strong>{stats.averageRating.toFixed(1)}</Text>
            <Text type="secondary">({stats.totalReviews} đánh giá)</Text>
          </Space>
          {stats.ratingDistribution && (
            <div>
              {Object.entries(stats.ratingDistribution)
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-2">
                    <Text>{rating} sao</Text>
                    <div className="w-48 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{
                          width: `${(count / stats.totalReviews) * 100}%`,
                        }}
                      />
                    </div>
                    <Text>{count}</Text>
                  </div>
                ))}
            </div>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div className="course-reviews">
      {renderStats()}

      {isEnrolled && !userHasReviewed && (
        <Button type="primary" onClick={handleAddReview} className="mb-4">
          Viết đánh giá
        </Button>
      )}

      <List
        itemLayout="vertical"
        dataSource={reviews}
        renderItem={(review) => (
          <List.Item
            actions={
              user?.id === review.user_id
                ? [
                    <Tooltip key="edit" title="Chỉnh sửa">
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditReview(review)}
                      />
                    </Tooltip>,
                    <Tooltip key="delete" title="Xóa">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteReview(review.id)}
                      />
                    </Tooltip>,
                  ]
                : []
            }
          >
            <List.Item.Meta
              title={review.user_name}
              description={
                <Space>
                  <Rate disabled value={review.rating} />
                  <Text type="secondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </Space>
              }
            />
            {review.review_text}
          </List.Item>
        )}
      />

      <Modal
        title={editingReview ? "Chỉnh sửa đánh giá" : "Thêm đánh giá"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="rating"
            label="Đánh giá"
            rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="reviewText"
            label="Nhận xét"
            rules={[{ required: true, message: "Vui lòng nhập nhận xét" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingReview ? "Cập nhật" : "Gửi đánh giá"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

CourseReviews.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isEnrolled: PropTypes.bool.isRequired,
};

export default CourseReviews;
