import React from "react";
import { Card, List } from "antd";

const MyCourses = () => {
    const courses = [
        { id: 1, title: "Khóa học 1" },
        { id: 2, title: "Khóa học 2" },
        { id: 3, title: "Khóa học 3" },
    ];

    return (
        <Card title="Khóa học của tôi">
            <List
                dataSource={courses}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta title={item.title} />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default MyCourses;
