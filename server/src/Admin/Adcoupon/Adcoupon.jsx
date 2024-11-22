import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Modal,
  message,
} from "antd";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";

const { Option } = Select;

const AdminAddCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/coupons`);

      // Ensure that response.data is an array
      if (Array.isArray(response.data)) {
        setCoupons(response.data);
      } else {
        // Handle unexpected data structure
        console.error("Unexpected response format:", response.data);
        setCoupons([]); // Set an empty array if the data is not as expected
      }
    } catch (error) {
      message.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle form submission (create/update)
  const handleSubmit = async (values) => {
    try {
      if (editingCoupon) {
        // Update existing coupon
        await axios.put(`${API_URL}/coupons/${editingCoupon.id}`, values);
        message.success("Cập nhật mã giảm giá thành công");
      } else {
        // Create new coupon
        await axios.post(`${API_URL}/addcoupons`, values);
        message.success("Thêm mã giảm giá thành công");
      }
      setModalVisible(false);
      form.resetFields();
      fetchCoupons();
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/coupons/${id}`);
      message.success("Xóa mã giảm giá thành công");
      fetchCoupons();
    } catch (error) {
      message.error("Không thể xóa mã giảm giá");
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    setEditingCoupon(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Mã giảm giá",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Giá trị",
      dataIndex: "discount_amount",
      key: "discount_amount",
    },
    {
      title: "Loại",
      dataIndex: "discount_type",
      key: "discount_type",
      render: (type) =>
        type === "percentage" ? "Phần trăm" : "Số tiền cố định",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Quản lý mã giảm giá</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditingCoupon(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm mã giảm giá
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={coupons}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCoupon ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã giảm giá!" },
              { max: 50, message: "Mã không được vượt quá 50 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập mã giảm giá" />
          </Form.Item>

          <Form.Item
            label="Giá trị giảm"
            name="discount_amount"
            rules={[{ required: true, message: "Vui lòng nhập giá trị giảm!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="Nhập giá trị giảm"
            />
          </Form.Item>

          <Form.Item
            label="Loại giảm giá"
            name="discount_type"
            rules={[
              { required: true, message: "Vui lòng chọn loại giảm giá!" },
            ]}
          >
            <Select placeholder="Chọn loại giảm giá">
              <Option value="percentage">Phần trăm (%)</Option>
              <Option value="fixed">Số tiền cố định</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCoupon ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAddCoupon;
