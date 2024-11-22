import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Pagination,
  Spin,
  Modal,
  Typography,
  Empty,
  Button,
} from "antd";
import styled from "styled-components";
// Import the CSS module here
import styles from "./BlogPage.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const StyledCard = styled(Card)`
  width: 100%;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 16px;

    @media (min-width: 768px) {
      padding: 24px; // Tăng padding cho màn hình lớn
    }
  }
`;

const Container = styled.div`
  max-width: 100%; // Để toàn bộ phần tử phù hợp với chiều rộng màn hình
  padding: 16px;

  @media (min-width: 768px) {
    max-width: 1200px; // Giới hạn chiều rộng tối đa cho màn hình lớn
    margin: 0 auto;
    padding: 24px;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  justify-content: ${(props) => (props.alignRight ? "flex-end" : "flex-start")};
  width: 100%;
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 16px;

    @media (min-width: 768px) {
      padding: 24px;
    }
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
`;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullContent, setFullContent] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const pageSize = 4;

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi URL thay đổi
    window.scrollTo(0, 0);
  }, [location]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9000/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetail = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:9000/api/posts/${id}`);
      const data = await response.json();
      setSelectedPost(data);
      setFullContent(data.content); // Assuming the API returns the full content
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching post detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCardClick = (post) => {
    fetchPostDetail(post.id);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedPost(null);
    setFullContent("");
  };

  const currentPosts = (posts || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div>
        <Button
          className="btn-back"
          onClick={() => navigate(-1)}
          style={{ margin: 10, marginLeft: 100 }}
        >
          ← Quay lại
        </Button>
      </div>
      <Container>
        <Spin spinning={loading}>
          {posts.length === 0 ? (
            <Empty description="Không có bài viết nào" />
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {currentPosts.map((post, index) => (
                  <Col
                    xs={24} // Chiếm toàn bộ chiều rộng trên màn hình nhỏ
                    sm={24} // Tương tự màn hình nhỏ
                    md={12} // Chia làm 2 cột trên màn hình trung bình
                    lg={12} // Tương tự màn hình lớn
                    key={post.id}
                  >
                    <CardWrapper alignRight={index % 2 !== 0}>
                      <StyledCard
                        onClick={() => handleCardClick(post)}
                        cover={
                          post.image && (
                            <img
                              alt={post.title}
                              src={post.image}
                              style={{
                                height: 200,
                                objectFit: "cover",
                                objectPosition: "center",
                              }}
                            />
                          )
                        }
                      >
                        <Card.Meta
                          title={post.title}
                          description={
                            <>
                              <Paragraph className={styles.excerpt}>
                                {post.excerpt}
                              </Paragraph>
                              <Text type="secondary">
                                {formatDate(post.date)}
                              </Text>
                            </>
                          }
                        />
                      </StyledCard>
                    </CardWrapper>
                  </Col>
                ))}
              </Row>

              <Row justify="center" style={{ marginTop: 24 }}>
                <Pagination
                  current={currentPage}
                  total={posts.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  responsive // Ant Design tự động làm responsive cho Pagination
                />
              </Row>
            </>
          )}

          <StyledModal
            title={selectedPost?.title}
            open={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={800}
          >
            <Spin spinning={loading}>
              {selectedPost && (
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
                    />
                  )}
                  <Title level={4}>{selectedPost.title}</Title>

                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: "16px" }}
                  >
                    {formatDate(selectedPost.date)}
                  </Text>
                  <div dangerouslySetInnerHTML={{ __html: fullContent }} />
                  <Paragraph>{selectedPost.excerpt}</Paragraph>
                </ContentContainer>
              )}
            </Spin>
          </StyledModal>
        </Spin>
      </Container>
    </>
  );
};

export default BlogPage;
