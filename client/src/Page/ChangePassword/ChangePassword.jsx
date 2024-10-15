import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Alert, message } from "antd";
import axios from "axios";

const ChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            setUser({ ...storedUser, token });
        } else {
            setError("Không tìm thấy thông tin người dùng hoặc token. Vui lòng đăng nhập lại.");
        }
    }, []);

    const onFinish = async (values) => {
        const { oldPassword, newPassword } = values;
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!user || !user.id || !user.token) {
                throw new Error("Không tìm thấy thông tin người dùng hoặc token. Vui lòng đăng nhập lại.");
            }

            const response = await axios.post(
                "http://localhost:9000/api/change-password",
                { 
                    userId: user.id, 
                    oldPassword, 
                    newPassword 
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess(true);
                message.success("Đổi mật khẩu thành công!");
            } else {
                setError(response.data.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Error in change password:", err);
            if (err.response && err.response.status === 401) {
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                // Có thể thêm logic để đăng xuất người dùng ở đây
            } else {
                setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Alert message="Vui lòng đăng nhập để đổi mật khẩu" type="warning" showIcon />;
    }

    return (
        <Card title="Đổi mật khẩu">
            {error && <Alert message="Lỗi" description={error} type="error" showIcon />}
            {success && <Alert message="Thành công" description="Mật khẩu đã được đổi thành công!" type="success" showIcon />}
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Mật khẩu cũ"
                    name="oldPassword"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                        { 
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                            message: "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số!"
                        }
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Đổi mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ChangePassword;