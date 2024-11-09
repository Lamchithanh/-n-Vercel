import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import styles from "./Testimonials.module.scss";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      role: "Học viên",
      content: "Các khóa học rất chất lượng và dễ hiểu. Giảng viên nhiệt tình.",
      avatar: null,
    },
    {
      id: 2,
      name: "Trần Thị B",
      role: "Developer",
      content:
        "Tôi đã học được rất nhiều kiến thức mới và áp dụng vào công việc.",
      avatar: null,
    },
    {
      id: 3,
      name: "Lê Văn C",
      role: "Designer",
      content: "Platform học tập tuyệt vời với nhiều tính năng hữu ích.",
      avatar: null,
    },
  ];

  return (
    <div className={styles.testimonials__container}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className={styles.testimonials__title}>
          Học Viên Nói Gì Về Chúng Tôi
        </h2>
      </div>

      <div className={styles.testimonials__track}>
        {/* First set of testimonials */}
        <div className={styles.testimonials__slider}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonials__card}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={testimonial.avatar}
                className={styles.testimonials__avatar}
              />
              <h3 className={styles.testimonials__name}>{testimonial.name}</h3>
              <p className={styles.testimonials__role}>{testimonial.role}</p>
              <p className={styles.testimonials__content}>
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>

        {/* Duplicated set for seamless loop */}
        <div className={styles.testimonials__slider}>
          {testimonials.map((testimonial) => (
            <div
              key={`${testimonial.id}-duplicate`}
              className={styles.testimonials__card}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={testimonial.avatar}
                className={styles.testimonials__avatar}
              />
              <h3 className={styles.testimonials__name}>{testimonial.name}</h3>
              <p className={styles.testimonials__role}>{testimonial.role}</p>
              <p className={styles.testimonials__content}>
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
