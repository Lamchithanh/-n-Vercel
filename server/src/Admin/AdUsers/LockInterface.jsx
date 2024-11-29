import React, { useState } from "react";
import { Modal, Form, Input, Select, message, InputNumber } from "antd";

const { Option } = Select;

const LockUserModal = ({ visible, onCancel, onConfirm, user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customDuration, setCustomDuration] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false); // State for unlock confirmation

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Xử lý thời gian tùy chọn
      if (
        customDuration &&
        values.customDurationValue &&
        values.customDurationUnit
      ) {
        values.duration = `${values.customDurationValue}${values.customDurationUnit}`;
      }

      await onConfirm({
        isLocked: true,
        ...values,
      });

      form.resetFields();
      setCustomDuration(false);
      message.success("Khóa tài khoản thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra khi khóa tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockConfirm = () => {
    setShowUnlockConfirm(true); // Trigger confirmation dialog for unlocking
  };

  const handleUnlock = async () => {
    try {
      setLoading(true);
      // Proceed with unlocking
      await onConfirm({
        isLocked: false,
      });
      setShowUnlockConfirm(false); // Close confirmation dialog
      message.success("Mở khóa tài khoản thành công");
    } catch (error) {
      message.error("Có lỗi xảy ra khi mở khóa tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (value) => {
    if (value === "custom") {
      setCustomDuration(true);
    } else {
      setCustomDuration(false);
    }
  };

  return (
    <Modal
      title={`${user?.isLocked ? "Mở khóa" : "Khóa"} tài khoản: ${
        user?.username
      }`}
      open={visible}
      onOk={user?.isLocked ? handleUnlock : handleOk} // Adjust onOk behavior based on lock status
      onCancel={() => {
        onCancel();
        form.resetFields();
        setCustomDuration(false);
        setShowUnlockConfirm(false); // Reset unlock confirmation state on cancel
      }}
      confirmLoading={loading}
      okText={user?.isLocked ? "Mở khóa" : "Khóa"}
      cancelText="Hủy"
      destroyOnClose
    >
      {!user?.isLocked && (
        <Form form={form} layout="vertical">
          <Form.Item
            name="lockReason"
            label="Lý do khóa"
            rules={[{ required: true, message: "Vui lòng nhập lý do khóa!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời gian khóa"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian khóa!" },
            ]}
          >
            <Select onChange={handleDurationChange}>
              <Option value="1h">1 giờ</Option>
              <Option value="24h">24 giờ</Option>
              <Option value="7d">7 ngày</Option>
              <Option value="30d">30 ngày</Option>
              <Option value="permanent">Vĩnh viễn</Option>
              <Option value="custom">Tùy chọn</Option>
            </Select>
          </Form.Item>

          {customDuration && (
            <Form.Item
              label="Thời gian tùy chọn"
              required
              style={{ marginBottom: 0 }}
            >
              <Form.Item
                name="customDurationValue"
                rules={[
                  { required: true, message: "Vui lòng nhập giá trị!" },
                  {
                    type: "number",
                    min: 1,
                    message: "Giá trị phải lớn hơn 0!",
                  },
                ]}
                style={{
                  display: "inline-block",
                  width: "calc(60% - 8px)",
                  marginRight: "8px",
                }}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập số"
                />
              </Form.Item>
              <Form.Item
                name="customDurationUnit"
                rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
                style={{ display: "inline-block", width: "40%" }}
              >
                <Select placeholder="Đơn vị">
                  <Option value="p">Phút</Option>
                  <Option value="h">Giờ</Option>
                  <Option value="d">Ngày</Option>
                </Select>
              </Form.Item>
            </Form.Item>
          )}
        </Form>
      )}

      {user?.isLocked && (
        <>
          <p>Bạn có chắc chắn muốn mở khóa tài khoản này?</p>
          <button onClick={handleUnlockConfirm}>Mở khóa tài khoản</button>{" "}
          {/* Trigger the unlock confirmation */}
        </>
      )}

      {/* Modal to confirm unlocking */}
      <Modal
        title="Xác nhận mở khóa tài khoản"
        open={showUnlockConfirm}
        onCancel={() => setShowUnlockConfirm(false)} // Close confirmation modal
        onOk={handleUnlock} // Handle unlock confirmation
        okText="Mở khóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn mở khóa tài khoản của người dùng này?</p>
      </Modal>
    </Modal>
  );
};

export default LockUserModal;
