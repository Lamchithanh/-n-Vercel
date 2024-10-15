import React, { useEffect, useState } from "react";
import { Card, Descriptions, Alert } from "antd";

const UserInfo = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user"); // Lấy thông tin người dùng từ localStorage
        if (userData) {
            setUser(JSON.parse(userData)); // Chuyển đổi dữ liệu thành đối tượng
        } else {
            setError("Không tìm thấy thông tin người dùng.");
        }
        setLoading(false); // Kết thúc quá trình tải
    }, []);

    if (loading) {
        return <p>Đang tải thông tin người dùng...</p>;
    }

    if (error) {
        return (
            <Alert message="Lỗi" description={error} type="error" showIcon />
        );
    }

    if (!user) {
        return (
            <Alert
                message="Thông báo"
                description="Không tìm thấy thông tin người dùng. Vui lòng kiểm tra lại kết nối hoặc liên hệ hỗ trợ."
                type="warning"
                showIcon
            />
        );
    }

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleString() : "Không rõ";
    };

    return (
        <Card title="Thông tin người dùng">
            <Descriptions layout="vertical" bordered>
                <Descriptions.Item label="Tên người dùng">
                    {user.username}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                    {user.email}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                    {user.role === "admin"
                        ? "Quản trị viên"
                        : user.role === "instructor"
                        ? "Giảng viên"
                        : "Học viên"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                    {formatDate(user.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                    {formatDate(user.updatedAt)}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default UserInfo;
