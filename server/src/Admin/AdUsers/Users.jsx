import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  message,
  Switch,
} from "antd";
import axios from "axios";
import LockUserModal from "./LockInterface";

const { TabPane } = Tabs;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [lockingUser, setLockingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:9000/api/users");
      const updatedUsers = response.data;
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Unable to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateLockedStatus = useCallback(() => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (!user.isLocked || !user.lockedUntil) return user;

        const lockEndTime = new Date(user.lockedUntil);
        const now = new Date();

        if (lockEndTime <= now) {
          return {
            ...user,
            isLocked: false,
            lockedUntil: null,
            lockReason: null,
          };
        }
        return user;
      })
    );
  }, []);

  const calculateLockUntil = (duration) => {
    if (duration === "permanent") return null;

    const now = new Date();
    // Xử lý thời gian tùy chọn
    if (/^\d+[phd]$/.test(duration)) {
      const value = parseInt(duration);
      const unit = duration.slice(-1);
      const multipliers = {
        p: 60 * 1000, // phút
        h: 60 * 60 * 1000, // giờ
        d: 24 * 60 * 60 * 1000, // ngày
      };
      return new Date(now.getTime() + value * multipliers[unit]).toISOString();
    }

    // Xử lý các trường hợp định sẵn
    const durationMap = {
      "1p": 60 * 1000,
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const milliseconds = durationMap[duration];
    if (!milliseconds) return null;

    return new Date(now.getTime() + milliseconds).toISOString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    // Chuyển đổi thời gian từ UTC sang giờ địa phương
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const isAccountLocked = (user) => {
    if (user.isLocked) {
      if (!user.lockedUntil) return true; // Khóa vĩnh viễn
      const lockEndTime = new Date(user.lockedUntil);
      const now = new Date();
      return lockEndTime > now; // Còn trong thời gian khóa
    }
    return false; // Không bị khóa
  };

  useEffect(() => {
    const intervalId = setInterval(updateLockedStatus, 60000);
    return () => clearInterval(intervalId);
  }, [updateLockedStatus]);

  const handleAddOrUpdateUser = async (values) => {
    try {
      if (editingUser) {
        await axios.put(
          `http://localhost:9000/api/users/${editingUser.id}`,
          values
        );
        message.success("User updated successfully");
      } else {
        await axios.post("http://localhost:9000/api/users", values);
        message.success("User added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchUsers(); // Fetch lại sau khi thêm/sửa
    } catch (error) {
      console.error("Error adding/updating user:", error);
      message.error(
        error.response?.data?.message ||
          "Unable to add/update user. Please try again."
      );
    }
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      content: "This action cannot be undone!",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:9000/api/users/${userId}`);
          message.success("User deleted successfully");
          fetchUsers(); // Fetch lại sau khi xóa
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error("Unable to delete user. Please try again.");
        }
      },
    });
  };

  const handleConfirmLock = async (lockData) => {
    try {
      let duration = lockData.duration;
      if (duration === "custom") {
        duration = `${lockData.customDurationValue}${lockData.customDurationUnit}`;
      }

      const lockedUntil =
        duration === "permanent" ? null : calculateLockUntil(duration);

      const response = await axios.put(
        `http://localhost:9000/api/users/${lockingUser.id}/lock`,
        {
          isLocked: true,
          lockReason: lockData.reason,
          duration: duration,
          lockedUntil: lockedUntil,
        }
      );

      if (response.data?.data) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === lockingUser.id) {
              return {
                ...user,
                ...response.data.data,
              };
            }
            return user;
          })
        );
      }

      setLockModalVisible(false);
      message.success("Account locked successfully");
    } catch (error) {
      console.error("Error locking account:", error);
      message.error("Unable to lock account. Please try again.");
    }
  };

  const handleToggleLock = async (user, checked) => {
    if (checked) {
      // If turning on the lock
      setLockingUser(user);
      setLockModalVisible(true);
    } else {
      // If turning off the lock (unlocking)
      try {
        const response = await axios.put(
          `http://localhost:9000/api/users/${user.id}/lock`,
          {
            isLocked: false,
            lockReason: null,
            duration: null,
            lockedUntil: null,
          }
        );

        // Update local state immediately
        setUsers(
          users.map((u) => {
            if (u.id === user.id) {
              return {
                ...u,
                ...response.data, // Use server response data if available
                isLocked: false,
                lockReason: null,
                lockedUntil: null,
              };
            }
            return u;
          })
        );

        message.success("Account unlocked successfully");
      } catch (error) {
        console.error("Error unlocking account:", error);
        message.error("Unable to unlock account. Please try again.");
      }
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Account Locked",
      dataIndex: "isLocked",
      key: "isLocked",
      render: (_, record) => {
        const isLocked = isAccountLocked(record);
        return (
          <Switch
            checked={record.isLocked || isLocked}
            onChange={(checked) => handleToggleLock(record, checked)}
          />
        );
      },
    },
    {
      title: "Lock Status",
      key: "lockStatus",
      render: (_, record) => {
        if (!record.isLocked) return "Hoạt động";
        if (!record.lockedUntil) return "Khóa vĩnh viễn";
        const lockEnd = new Date(record.lockedUntil);
        const now = new Date();
        if (lockEnd <= now) {
          return `Tạm khóa đến: ${formatDateTime(record.lockedUntil)}`;
        }
        return "Hoạt động";
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDeleteUser(record.id)}
            style={{ marginLeft: 8 }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Button
        onClick={() => {
          setEditingUser(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Add New User
      </Button>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Students" key="1">
          <Table
            columns={columns}
            dataSource={users.filter((user) => user.role === "student")}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="Instructors" key="2">
          <Table
            columns={columns}
            dataSource={users.filter((user) => user.role === "instructor")}
            rowKey="id"
          />
        </TabPane>
      </Tabs>

      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdateUser}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input the username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input the email!" }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input the password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select the role!" }]}
          >
            <Select>
              <Option value="student">Student</Option>
              <Option value="instructor">Instructor</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <LockUserModal
        user={lockingUser}
        visible={lockModalVisible}
        onCancel={() => setLockModalVisible(false)}
        onConfirm={handleConfirmLock}
      />
    </Spin>
  );
};

export default Users;
