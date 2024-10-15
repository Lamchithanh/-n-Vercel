import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, message } from 'antd';
// import { fetchMyCourses } from '../../../../server/src/api'; // Giả sử bạn có API này
import defaultImage from '../../assets/img/sach.png';

const { Title } = Typography;

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        const data = await fetchMyCourses();
        setCourses(data);
      } catch (error) {
        console.error('Lỗi khi tải khóa học:', error);
        message.error('Không thể tải khóa học của bạn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="my-courses">
      <Title level={2}>Khóa học của tôi</Title>
      <Row gutter={[16, 16]}>
        {courses.map(course => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              hoverable
              cover={<img alt={course.title} src={course.image || defaultImage} />}
              onClick={() => {/* Có thể thêm logic để điều hướng đến trang chi tiết khóa học */}}
            >
              <Card.Meta
                title={course.title}
                description={course.description}
              />
            </Card>
          </Col>
        ))}
      </Row>
      {courses.length === 0 && (
        <p>Bạn chưa đăng ký khóa học nào.</p>
      )}
    </div>
  );
};

export default MyCourses;