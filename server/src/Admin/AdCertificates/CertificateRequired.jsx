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
        <Button type="primary" onClick={() => showRequestDetails(record)}>
          Xem chi tiết
        </Button>
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
      <h1>Quản lý yêu cầu cấp chứng chỉ</h1>
      <Table
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
        width="auto"
        style={{ maxWidth: "90vw" }}
        bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
      >
        {currentRequest && (
          <div style={{ minWidth: "300px", padding: "20px" }}>
            <p>
              <strong>Người yêu cầu:</strong> {currentRequest.username}
            </p>
            <p>
              <strong>Khóa học:</strong> {currentRequest.course_name}
            </p>
            <p>
              <strong>Ngày yêu cầu:</strong> {currentRequest.request_date}
            </p>
            <div style={{ marginTop: "20px" }}>
              <Button
                onClick={() => handleAccept(currentRequest.id)}
                type="primary"
              >
                Chấp nhận
              </Button>
              <Button
                onClick={() => handleReject(currentRequest.id)}
                danger
                style={{ marginLeft: 8 }}
              >
                Từ chối
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CertificateRequired;
