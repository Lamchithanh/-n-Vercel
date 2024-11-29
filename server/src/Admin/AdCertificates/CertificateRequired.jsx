import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal, Tooltip, Typography } from "antd";
import axios from "axios";

const { Paragraph } = Typography;

const CertificateRequired = () => {
  const [requests, setRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:9000/api/certificates/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const formattedRequests = response.data.map((request) => ({
        ...request,
        request_date: formatDate(request.request_date),
      }));
      setRequests(formattedRequests);
    } catch (error) {
      console.error("Lỗi khi lấy yêu cầu:", error);
      message.error("Không thể lấy yêu cầu chứng chỉ.");
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:9000/api/certificates/accept/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Đã chấp nhận yêu cầu chứng chỉ.");
      setIsModalVisible(false);
      fetchRequests();
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu:", error);
      message.error("Không thể chấp nhận yêu cầu.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:9000/api/certificates/reject/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Đã từ chối yêu cầu chứng chỉ.");
      setIsModalVisible(false);
      fetchRequests();
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
      message.error("Không thể từ chối yêu cầu.");
    }
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "username",
      key: "username",
      width: "20%",
    },
    {
      title: "Khóa học",
      dataIndex: "course_name",
      key: "course_name",
      width: "40%",
      render: (text) => (
        <Tooltip title={text}>
          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
            {text}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "request_date",
      key: "request_date",
      width: "20%",
    },
    {
      title: "Hành động",
      key: "action",
      width: "20%",
      render: (text, record) => (
        <Button onClick={() => showRequestDetails(record)}>Xem chi tiết</Button>
      ),
    },
  ];

  const showRequestDetails = (request) => {
    setCurrentRequest(request);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <h3>Quản lý yêu cầu cấp chứng chỉ</h3>
      <Table
        style={{ width: "100%" }}
        dataSource={requests}
        columns={columns}
        rowKey="id"
        scroll={{ x: true }}
      />

      <Modal
        title="Chi tiết yêu cầu cấp chứng chỉ"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width="30vw"
        style={{ maxWidth: "100vw" }}
        bodyStyle={{
          maxHeight: "80vh",
          overflow: "auto",
          padding: "20px",
        }}
      >
        {currentRequest && (
          <div>
            <p>
              <strong>Người yêu cầu:</strong> {currentRequest.username}
            </p>
            <p>
              <strong>Khóa học:</strong> {currentRequest.course_name}
            </p>
            <p>
              <strong>Ngày yêu cầu:</strong> {currentRequest.request_date}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start", // Hoặc "center" nếu muốn nút ở giữa
                gap: "8px",
                marginTop: "20px",
              }}
            >
              <button
                className="btn_title"
                onClick={() => handleAccept(currentRequest.id)}
              >
                Chấp nhận
              </button>
              <button
                className="btn_title"
                onClick={() => handleReject(currentRequest.id)}
                danger
              >
                Từ chối
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificateRequired;
