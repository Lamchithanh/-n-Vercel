import React, { useState } from "react";
import { Card, Form, Input, Button } from "antd";

const ChangePassword = () => {
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý đổi mật khẩu
    };

    return (
        <Card title="Đổi mật khẩu">
            <Form onSubmit={handleSubmit}>
                <Form.Item label="Mật khẩu cũ">
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Mật khẩu mới">
                    <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Xác nhận mật khẩu mới">
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Đổi mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ChangePassword;
