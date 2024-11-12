import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";
import axios from "axios";

const CertificateRequired = () => {
  const [requests, setRequests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null); // Thông tin yêu cầu hiện tại

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:9000/api/certificates/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data); // Lưu dữ liệu yêu cầu vào state
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
      setIsModalVisible(false); // Đóng modal
      fetchRequests(); // Làm mới danh sách yêu cầu
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
      setIsModalVisible(false); // Đóng modal
      fetchRequests(); // Làm mới danh sách yêu cầu
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
      message.error("Không thể từ chối yêu cầu.");
    }
  };

  const columns = [
    { title: "Người dùng", dataIndex: "username", key: "username" },
    { title: "Khóa học", dataIndex: "course_name", key: "course_name" },
    { title: "Ngày yêu cầu", dataIndex: "request_date", key: "request_date" },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={() => showRequestDetails(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const showRequestDetails = (request) => {
    setCurrentRequest(request); // Lưu thông tin yêu cầu vào state
    setIsModalVisible(true); // Mở modal
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Đóng modal
  };

  return (
    <div>
      <h1>Quản lý yêu cầu cấp chứng chỉ</h1>
      <Table dataSource={requests} columns={columns} rowKey="id" />

      {/* Modal hiển thị chi tiết yêu cầu */}
      <Modal
        title="Chi tiết yêu cầu cấp chứng chỉ"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
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
            <div>
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
