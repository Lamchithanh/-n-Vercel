import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Pagination,
  message,
} from "antd";
import axios from "axios";
import "./CertificatesPage.scss";

const { Title, Text } = Typography;
const PAGE_SIZE = 1;

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:9000/api/certificates?page=${currentPage}&pageSize=${PAGE_SIZE}`
        );
        let data = response.data;
        let total = 0;

        if (!Array.isArray(data)) {
          data = [data];
          total = 1;
        } else {
          total = response.data.total;
        }

        setCertificates(data);
        setTotalCertificates(total);
      } catch (err) {
        setError("Không thể tải chứng chỉ. Vui lòng thử lại sau.");
        console.error(err);
        message.error("Không thể tải chứng chỉ. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="certificates-loading">
        <Spin size="large" />
        <Text>Đang tải chứng chỉ...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificates-error">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    // <div className="certificates-page">
    //   <div className="certificates-header">
    //     <Title level={2}>Chứng Chỉ Của Tôi</Title>
    //     <Text type="secondary">
    //       Những thành tựu đáng tự hào từ các khóa học bạn đã hoàn thành. Chứng
    //       chỉ sẽ là minh chứng cho sự nỗ lực và cam kết của bạn trong hành trình
    //       học tập.
    //     </Text>
    //   </div>

    //   {certificates.length === 0 ? (
    //     <Empty
    //       description="Bạn chưa có chứng chỉ nào"
    //       className="certificates-empty"
    //     />
    //   ) : (
    //     <>
    //       <Row className="certificates">
    //         {certificates.map((cert) => (
    //           <Col key={cert.id}>
    //             <Card className="certificate-card" hoverable>
    //               <div className="certificate-content">
    //                 <div className="certificate-header">
    //                   <img
    //                     src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQjJbbOHf5Ef5kkZkW629-GgUS1_6Sow1jVWCDcfe6-JWclOc66"
    //                     alt="Certificate"
    //                     className="certificate-icon"
    //                   />
    //                   <div className="certificate-title">
    //                     {cert.course_title}
    //                   </div>
    //                 </div>

    //                 <div className="certificate-details">
    //                   <div className="detail-item">
    //                     <span className="label">Mã chứng chỉ:</span>
    //                     <span className="value">{cert.id}</span>
    //                   </div>
    //                   <div className="detail-item">
    //                     <span className="label">Ngày cấp:</span>
    //                     <span className="value">
    //                       {new Date(cert.issued_at).toLocaleDateString("vi-VN")}
    //                     </span>
    //                   </div>
    //                 </div>

    //                 <div className="certificate-footer">
    //                   <div className="issuer">
    //                     <Text type="secondary">Cấp bởi:</Text>
    //                     <Text strong>{cert.user_name}</Text>
    //                   </div>
    //                 </div>
    //               </div>
    //             </Card>
    //           </Col>
    //         ))}
    //       </Row>
    //       <div className="certificates-pagination">
    //         <Pagination
    //           current={currentPage}
    //           pageSize={PAGE_SIZE}
    //           total={totalCertificates}
    //           onChange={handlePageChange}
    //         />
    //       </div>
    //     </>
    //   )}
    // </div>
    <>
      <div className="certificates-container">
        <form className="form-certificates">
          <div className="columne1"></div>
          <div></div>

          <div className="border-form">
            <div className="certificates-title">
              <h4>QT - Learning</h4>
              <p>Trao tặng</p>
              <h2>Bằng khen</h2>
            </div>

            <div className="certificates-username">Nguyễn Thị Mỹ Vy</div>
            <div className="certificates-courses">
              <div>
                <span>Đã hoàn thành khóa học:</span>

                <span className="title-courses">
                  {" "}
                  Những Điều Cơ Bản về JavaScript
                </span>
              </div>
              <div className="certificates-describe">
                Thành phố Cần Thơ, <span>ngày 05 tháng 11 năm 2024</span>
              </div>
            </div>
            <div className="certificates-footer">
              <div className="certificates-footer-admin">
                <span style={{ marginBottom: 20 }}>Đặng Lâm Chí Thành</span>
              </div>
              <div className="certificates-footer-data">
                {" "}
                <span>Võ Ngọc Quỳnh</span>
              </div>
              <div className="certificates-footer-data">
                {" "}
                <img src="../../assets/img/condau.png" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CertificatesPage;
