import { useEffect, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, message, Modal, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const { Text } = Typography;

const StyledCard = styled(Card)`
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 24px;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 24px;
  }

  .ant-modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }
`;

const ContentContainer = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #333;

  img {
    max-width: 100%;
    height: auto;
    margin: 16px 0;
    border-radius: 8px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 24px;
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 16px;
  }
`;

const ExcerptText = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 4.5em;
  line-height: 1.5em;
`;

const BlogSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:9000/api"; // Centralize API URL

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

  const styles = {
    blogSection: {
      padding: "60px 0",
      backgroundColor: "#E2EBEB",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    title: {
      fontSize: "32px",
      margin: 0,
    },
    viewAllBtn: {
      fontSize: "16px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "30px",
      "@media (max-width: 768px)": {
        gridTemplateColumns: "repeat(1, 1fr)",
      },
    },
    cardImage: {
      height: "200px",
      objectFit: "cover",
      width: "100%",
    },
    date: {
      color: "#666",
      marginBottom: "8px",
      fontSize: "14px",
    },
    postTitle: {
      fontSize: "18px",
      marginBottom: "12px",
      fontWeight: "600",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      lineHeight: "1.5",
      height: "3em",
    },
    readMoreBtn: {
      padding: 0,
      height: "auto",
      fontSize: "14px",
      marginTop: "12px",
    },
    arrow: {
      fontSize: "12px",
      marginLeft: "4px",
    },
  };

  return (
    <section style={styles.blogSection}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tin Tức Mới Nhất</h2>
          <Button type="link" style={styles.viewAllBtn} onClick={handleViewAll}>
            Xem tất cả <ArrowRightOutlined style={styles.arrow} />
          </Button>
        </div>
        <Spin spinning={loading && posts.length === 0}>
          <div style={styles.grid}>
            {posts.map((post) => (
              <StyledCard
                style={{ border: " 1px #d4d4d4 solid" }}
                key={post.id}
                hoverable
                cover={
                  <img
                    alt={post.title}
                    src={post.image}
                    style={styles.cardImage}
                    onError={(e) => {
                      e.target.src = "/fallback-image.jpg"; // Add a fallback image
                    }}
                  />
                }
                onClick={() => handleCardClick(post)}
              >
                <Text style={styles.date}>{formatDate(post.date)}</Text>
                <h3 style={styles.postTitle}>{post.title}</h3>
                <ExcerptText type="secondary">
                  {truncateText(post.excerpt, 120)}
                </ExcerptText>
                <Button
                  type="link"
                  style={styles.readMoreBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAll();
                  }}
                >
                  Đọc thêm <ArrowRightOutlined style={styles.arrow} />
                </Button>
              </StyledCard>
            ))}
          </div>
        </Spin>
      </div>

      <StyledModal
        title={selectedPost?.title}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Spin spinning={loading}>
          {selectedPost ? (
            <ContentContainer>
              {selectedPost.image && (
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    objectFit: "cover",
                    marginBottom: "24px",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.src = "/fallback-image.jpg"; // Fallback image if the image doesn't load
                  }}
                />
              )}
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: "16px" }}
              >
                {formatDate(selectedPost.date)}
              </Text>
              {selectedPost.excerpt ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPost.excerpt }}
                />
              ) : (
                <Text type="secondary">
                  Không có nội dung cho bài viết này.
                </Text> // Fallback message if content is missing
              )}
            </ContentContainer>
          ) : (
            <Text type="secondary">Đang tải nội dung bài viết...</Text> // Fallback message while loading
          )}
        </Spin>
      </StyledModal>
    </section>
  );
};

export default BlogSection;
