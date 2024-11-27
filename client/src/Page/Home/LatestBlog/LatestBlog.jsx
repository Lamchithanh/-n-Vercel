import { useEffect, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, message, Modal, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./BlogSection.module.scss";

const { Text } = Typography;

const BlogSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:9000/api"; // Replace with your API URL

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const latestPosts = data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
      setPosts(latestPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate("/blogpage");
  };

  const handleCardClick = async (post) => {
    try {
      setLoading(true);
      setModalVisible(true);

      const response = await fetch(`${API_BASE_URL}/posts/${post.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPost(data);
    } catch (error) {
      console.error("Error fetching post details:", error);
      message.error("Không thể tải chi tiết bài viết. Vui lòng thử lại sau.");
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <section className={styles["blog-section"]}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tin Tức Mới Nhất</h2>
          <Button
            type="link"
            className={styles["view-all-btn"]}
            onClick={handleViewAll}
          >
            Xem tất cả <ArrowRightOutlined className={styles.arrow} />
          </Button>
        </div>
        <Spin spinning={loading && posts.length === 0}>
          <div className={styles.grid}>
            {posts.map((post) => (
              <Card
                className={styles["blog-card"]}
                key={post.id}
                hoverable
                cover={
                  <img
                    alt={post.title}
                    src={post.image}
                    className={styles["card-image"]}
                    onError={(e) => {
                      e.target.src = "/fallback-image.jpg"; // Fallback image
                    }}
                  />
                }
                onClick={() => handleCardClick(post)}
              >
                <Text className={styles.date}>{formatDate(post.date)}</Text>
                <h3 className={styles["post-title"]}>{post.title}</h3>
                <Text className={styles.excerpt}>
                  {truncateText(post.excerpt, 120)}
                </Text>
                <p>
                  <Button
                    type="link"
                    className={styles["read-more-btn"]}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAll();
                    }}
                  >
                    Đọc thêm <ArrowRightOutlined className={styles.arrow} />
                  </Button>
                </p>
              </Card>
            ))}
          </div>
        </Spin>
      </div>

      <Modal
        title={selectedPost?.title}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        className="modal_blog"
      >
        <Spin spinning={loading}>
          {selectedPost ? (
            <div className={styles["content-container"]}>
              {selectedPost.image && (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className={styles["post-image"]}
                  onError={(e) => {
                    e.target.src = "/fallback-image.jpg";
                  }}
                />
              )}
              <Text type="secondary" className={styles["post-date"]}>
                {formatDate(selectedPost.date)}
              </Text>
              {selectedPost.excerpt ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPost.excerpt }}
                />
              ) : (
                <Text type="secondary">
                  Không có nội dung cho bài viết này.
                </Text>
              )}
            </div>
          ) : (
            <Text type="secondary">Đang tải nội dung bài viết...</Text>
          )}
        </Spin>
      </Modal>
    </section>
  );
};

export default BlogSection;
