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
  DatePicker,
} from "antd";
import axios from "axios";
import { API_URL } from "../../../../server/src/config/config";
import "./AdminAddCoupon.scss";
import moment from "moment";

const { Option } = Select;

const AdminAddCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/coupons`);

      // Ensure that response.data is an array
      if (Array.isArray(response.data)) {
        setCoupons(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setCoupons([]);
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

  const handleSubmit = async (values) => {
    try {
      const submissionValues = { ...values };

      // Đảm bảo chuyển đổi ngày một cách an toàn
      if (submissionValues.expiration_date) {
        // Sử dụng format ISO hoặc định dạng phù hợp với backend
        submissionValues.expiration_date = moment(
          submissionValues.expiration_date
        ).format("YYYY-MM-DD HH:mm:ss");
      } else {
        // Explicitly set to null if no date is selected
        submissionValues.expiration_date = null;
      }

      // Handle default max_usage if not provided
      if (!submissionValues.max_usage) {
        submissionValues.max_usage = 100; // Mặc định là 100 nếu không có giá trị nhập vào
      }

      if (editingCoupon) {
        await axios.put(
          `${API_URL}/updatecoupons/${editingCoupon.id}`,
          submissionValues
        );
        message.success("Cập nhật mã giảm giá thành công");
      } else {
        await axios.post(`${API_URL}/addcoupons`, submissionValues);
        message.success("Thêm mã giảm giá thành công");
      }

      // Reset form and close modal
      setModalVisible(false);
      setEditingCoupon(null);
      form.resetFields();

      // Refetch to ensure up-to-date data
      fetchCoupons();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error.message);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn chắc chắn muốn xóa mã giảm giá này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/coupons/${id}`);
          message.success("Xóa mã giảm giá thành công");
          fetchCoupons();
        } catch (error) {
          message.error("Không thể xóa mã giảm giá");
        }
      },
    });
  };

  // Handle edit
  const handleEdit = (record) => {
    const editRecord = { ...record };

    // Chuyển đổi ngày một cách an toàn
    if (editRecord.expiration_date) {
      editRecord.expiration_date = moment(editRecord.expiration_date);
    }

    form.resetFields();
    form.setFieldsValue(editRecord);
    setEditingCoupon(record);
    setModalVisible(true);
  };

  // Handle adding new coupon
  const handleAddNew = () => {
    // Reset form completely
    form.resetFields();

    // Set editingCoupon to null
    setEditingCoupon(null);

    // Open modal
    setModalVisible(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingCoupon(null);
    form.resetFields();
  };

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
      title: "Ngày hết hạn",
      dataIndex: "expiration_date",
      key: "expiration_date",
      render: (date) =>
        date ? moment(date).format("YYYY-MM-DD") : "Không giới hạn",
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
        <Button onClick={handleAddNew}>Thêm mã giảm giá</Button>
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
        onCancel={handleModalClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            ...editingCoupon,
            max_usage: editingCoupon?.max_usage || 100,
          }}
        >
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
          <Form.Item
            label="Số lần sử dụng tối đa"
            name="max_usage"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số lần sử dụng tối đa!",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item label="Số tiền mua tối thiểu" name="min_purchase_amount">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="Gia hạn">
            <Select
              placeholder="Chọn thời gian gia hạn"
              allowClear
              onChange={(value) => {
                let newExpirationDate = null;
                if (value) {
                  newExpirationDate = moment().add(value, "days");
                }
                form.setFieldsValue({
                  expiration_date: newExpirationDate,
                });
              }}
            >
              <Option value={7}>7 Ngày</Option>
              <Option value={30}>30 Ngày</Option>
              <Option value={90}>90 Ngày</Option>
              <Option value={365}>1 Năm</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ngày hết hạn" name="expiration_date">
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleModalClose}>Hủy</Button>
              <Button htmlType="submit">
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
