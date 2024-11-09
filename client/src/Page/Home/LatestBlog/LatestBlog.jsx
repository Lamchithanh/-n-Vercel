import { useEffect, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import styles from "./BlogSection.module.scss";

const BlogSection = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("http://localhost:9000/api/posts");
      const data = await response.json();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <section className={styles.blogSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tin Tức Mới Nhất</h2>
          <Button type="link" className={styles.viewAllBtn}>
            Xem tất cả <ArrowRightOutlined className={styles.arrow} />
          </Button>
        </div>
        <div className={styles.grid}>
          {posts.map((post) => (
            <Card
              key={post.id}
              hoverable
              cover={
                <img
                  alt={post.title}
                  src={post.image}
                  className={styles.cardImage}
                />
              }
              className={styles.card}
            >
              <p className={styles.date}>
                {new Date(post.date).toLocaleDateString("vi-VN")}
              </p>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.excerpt}>{post.excerpt}</p>
              <Button type="link" className={styles.readMoreBtn}>
                Đọc thêm <ArrowRightOutlined className={styles.arrow} />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
