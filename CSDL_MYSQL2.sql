-- Users
CREATE DATABASE mydatabase;
USE mydatabase;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_lessons INT DEFAULT 0,
  duration VARCHAR(50) DEFAULT 'N/A',
  total_videos INT DEFAULT 0,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enrollments
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);


-- Lessons
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  description TEXT,
  video_url VARCHAR(255),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
  transaction_id VARCHAR(255),
  payment_method ENUM('credit_card', 'paypal', 'bank_transfer') NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Progress Tracking
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL,
  last_watched_position INTEGER,
  total_time_watched INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url VARCHAR(255)
);

CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


ALTER TABLE quizzes MODIFY lesson_id BIGINT;
ALTER TABLE quiz_questions MODIFY quiz_id BIGINT;
ALTER TABLE quiz_answers MODIFY question_id BIGINT;
ALTER TABLE forum_topics MODIFY course_id BIGINT;
ALTER TABLE forum_topics MODIFY user_id BIGINT;
ALTER TABLE forum_replies MODIFY topic_id BIGINT;
ALTER TABLE forum_replies MODIFY user_id BIGINT;
ALTER TABLE payments MODIFY user_id BIGINT;
ALTER TABLE payments MODIFY course_id BIGINT;
ALTER TABLE progress MODIFY user_id BIGINT;
ALTER TABLE progress MODIFY lesson_id BIGINT;
ALTER TABLE certificates MODIFY user_id BIGINT;
ALTER TABLE certificates MODIFY course_id BIGINT;

INSERT INTO enrollments (user_id, course_id)
VALUES (2, 8);  -- user_id 1 đăng ký khoá học có course_id 1

INSERT INTO lessons (course_id, title, content, description, video_url, order_index)
VALUES (8, 'Lesson 1: Introduction', 'Content of lesson 1', 'Introduction to programming concepts', 'https://example.com/video1', 1);

-- liên kết bảng
ALTER TABLE courses
MODIFY instructor_id BIGINT UNSIGNED;

ALTER TABLE courses
ADD CONSTRAINT fk_instructor
FOREIGN KEY (instructor_id)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE enrollments
MODIFY user_id BIGINT UNSIGNED;

ALTER TABLE enrollments
ADD CONSTRAINT fk_user_enrollment
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE payments
MODIFY user_id BIGINT UNSIGNED;

ALTER TABLE payments
ADD CONSTRAINT fk_user_payment
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE progress
MODIFY user_id BIGINT UNSIGNED;

ALTER TABLE progress
ADD CONSTRAINT fk_user_progress
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE certificates
MODIFY user_id BIGINT UNSIGNED;

ALTER TABLE certificates
ADD CONSTRAINT fk_user_certificate
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- liên kết bảng courses

ALTER TABLE enrollments
MODIFY course_id BIGINT UNSIGNED;

ALTER TABLE enrollments
ADD CONSTRAINT fk_course_enrollment
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;

ALTER TABLE lessons
MODIFY course_id BIGINT UNSIGNED;

ALTER TABLE lessons
ADD CONSTRAINT fk_course_lesson
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;

ALTER TABLE payments
MODIFY course_id BIGINT UNSIGNED;

ALTER TABLE payments
ADD CONSTRAINT fk_course_payment
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;

ALTER TABLE progress
MODIFY lesson_id BIGINT UNSIGNED;

ALTER TABLE progress
ADD CONSTRAINT fk_lesson_progress
FOREIGN KEY (lesson_id)
REFERENCES lessons(id)
ON DELETE CASCADE;


ALTER TABLE certificates
MODIFY course_id BIGINT UNSIGNED;

ALTER TABLE certificates
ADD CONSTRAINT fk_course_certificate
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;

ALTER TABLE modules
MODIFY course_id BIGINT UNSIGNED;

ALTER TABLE modules
ADD CONSTRAINT fk_course_module
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;



