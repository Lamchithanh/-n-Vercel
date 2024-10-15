import React, { useState } from "react";
import { Card, Form, Input, Button } from "antd";

const AccountSettings = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý cài đặt tài khoản
    };

    return (
        <Card title="Cài đặt tài khoản">
            <Form onSubmit={handleSubmit}>
                <Form.Item label="Tên người dùng">
                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Email">
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AccountSettings;
