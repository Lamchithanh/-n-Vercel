import { useState, useEffect, useCallback } from "react";
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
  Select,
  Pagination,
  // Spin,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
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
const { Option } = Select;
const { confirm } = Modal;

const CourseReviews = ({ courseId, isEnrolled }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userReviewData, setUserReviewData] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Pagination và filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filterRating, setFilterRating] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Tách riêng hàm fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetchCourseReviews(courseId, {
        page: currentPage,
        limit: pageSize,
        rating: filterRating,
      });

      setReviews(response.reviews);
      setTotalReviews(response.pagination.total);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      message.error("Không thể tải đánh giá. Vui lòng thử lại");
    }
  }, [courseId, currentPage, pageSize, filterRating]);

  // Tách riêng hàm refresh data
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [statsData, userReviewStatus] = await Promise.all([
        getCourseReviewStats(courseId),
        user
          ? hasUserReviewedCourse(courseId)
          : { hasReviewed: false, review: null },
      ]);

      setStats(statsData);
      setUserReviewData(userReviewStatus);
      await fetchReviews();
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Không thể tải dữ liệu. Vui lòng thử lại");
    } finally {
      setIsLoadingData(false);
    }
  }, [courseId, user, fetchReviews]);

  useEffect(() => {
    if (courseId) {
      refreshData();
    }
  }, [courseId, refreshData]);

  const validateReview = (values) => {
    const errors = [];
    if (!values.reviewText?.trim() || values.reviewText.trim().length < 2) {
      errors.push("Nội dung đánh giá phải có ít nhất lớn hơn 0 ký tự");
    }
    if (values.reviewText?.length > 1000) {
      errors.push("Nội dung đánh giá không được quá 1000 ký tự");
    }
    return errors;
  };

  const handleSubmit = async (values) => {
    const errors = validateReview(values);
    if (errors.length > 0) {
      errors.forEach((error) => message.error(error));
      return;
    }

    setLoading(true);
    try {
      if (editingReview) {
        await updateCourseReview(editingReview.id, {
          rating: values.rating,
          reviewText: values.reviewText,
        });
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
      setEditingReview(null);
      form.resetFields();
      await refreshData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Không thể lưu đánh giá. Vui lòng thử lại";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    confirm({
      title: "Xác nhận xóa đánh giá",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await deleteCourseReview(reviewId);
          message.success("Xóa đánh giá thành công");
          await refreshData();
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            "Không thể xóa đánh giá. Vui lòng thử lại";
          message.error(errorMessage);
        }
      },
    });
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    form.setFieldsValue({
      rating: review.rating,
      reviewText: review.review_text,
    });
    setIsModalVisible(true);
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Card className="mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <div className="flex justify-between items-center">
            <Title level={4}>Đánh giá trung bình</Title>
            <Select
              allowClear
              placeholder="Lọc theo số sao"
              onChange={(value) => {
                setFilterRating(value);
                setCurrentPage(1);
              }}
              className="w-32"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <Option key={rating} value={rating}>
                  {rating} sao
                </Option>
              ))}
            </Select>
          </div>

          <Space align="center">
            <Rate disabled allowHalf value={stats.averageRating} />
            <Text strong>{stats.averageRating.toFixed(1)}</Text>
            <Text type="secondary">({stats.totalReviews} đánh giá)</Text>
          </Space>

          {stats.ratingDistribution && (
            <div className="space-y-2">
              {Object.entries(stats.ratingDistribution)
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-2">
                    <Text className="w-12">{rating} sao</Text>
                    <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${
                            stats.totalReviews
                              ? (count / stats.totalReviews) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <Text className="w-12 text-right">{count}</Text>
                  </div>
                ))}
            </div>
          )}
        </Space>
      </Card>
    );
  };

  const canAddReview = isEnrolled && !userReviewData?.review;

  return (
    <div className="course-reviews">
      {renderStats()}

      {canAddReview && (
        <Button
        style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }}
          type="primary"
          onClick={() => {
            setEditingReview(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          className="mb-4"
        >
          Viết đánh giá
        </Button>
      )}

      <List
        loading={isLoadingData}
        itemLayout="vertical"
        dataSource={reviews}
        locale={{
          emptyText: <Empty description="Chưa có đánh giá nào" />,
        }}
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
              title={
                <Space>
                  <Text strong>{review.user_name}</Text>
                  {review.is_verified_purchase && (
                    <Text type="success">Học viên đã đăng ký khóa học</Text>
                  )}
                </Space>
              }
              description={
                <Space>
                  <Rate disabled value={review.rating} />
                  <Text type="secondary">
                    {new Date(review.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                  {review.updated_at !== review.created_at && (
                    <Text type="secondary" italic>
                      (Đã chỉnh sửa)
                    </Text>
                  )}
                </Space>
              }
              avatar={review.avatar_url}
            />
            {review.review_text}
          </List.Item>
        )}
      />

      {totalReviews > pageSize && (
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalReviews}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} đánh giá`
            }
          />
        </div>
      )}

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
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{ rating: 5 }}
        >
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
            rules={[
              { required: true, message: "Vui lòng nhập nhận xét" },
              {
                min: 2,
                message: "Nội dung đánh giá phải có ít nhất 2 ký tự",
              },
              {
                max: 1000,
                message: "Nội dung đánh giá không được quá 1000 ký tự",
              },
            ]}
          >
            <TextArea
              rows={4}
              showCount
              maxLength={1000}
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="dashed" htmlType="submit" loading={loading}>
                {editingReview ? "Cập nhật" : "Gửi đánh giá"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setEditingReview(null);
                }}
              >
                Hủy
              </Button>
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
  isEnrolled: PropTypes.bool,
};

CourseReviews.defaultProps = {
  isEnrolled: false,
};

export default CourseReviews;
