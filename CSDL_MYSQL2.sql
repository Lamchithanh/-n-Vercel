-- Tạo cơ sở dữ liệu
CREATE DATABASE mydatabase;
USE mydatabase;

-- Bảng Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reset_token VARCHAR(64),
  reset_token_expiry BIGINT
);

-- Bảng Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id BIGINT UNSIGNED,
  price DECIMAL(10, 2) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_lessons INT DEFAULT 0,
  image VARCHAR(255),
  intro_video_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng Modules
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  course_id BIGINT UNSIGNED,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Lessons
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id BIGINT UNSIGNED,
  module_id BIGINT UNSIGNED, -- Liên kết bài học với module
  title VARCHAR(255) NOT NULL,
  content TEXT,
  description TEXT,
  video_url VARCHAR(255),
  duration VARCHAR(10),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Bảng Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  course_id BIGINT UNSIGNED,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
  transaction_id VARCHAR(255),
  payment_method ENUM('credit_card', 'paypal', 'bank_transfer') NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Enrollments
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  course_id BIGINT UNSIGNED,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Progress Tracking
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  lesson_id BIGINT UNSIGNED,
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL,
  last_watched_position INTEGER,
  total_time_watched INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Bảng Certificates
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  course_id BIGINT UNSIGNED,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Course Reviews
CREATE TABLE course_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- Khóa chính của bảng
  course_id BIGINT UNSIGNED NOT NULL,             -- Khóa ngoại tham chiếu đến courses.id
  user_id BIGINT UNSIGNED NOT NULL,               -- Khóa ngoại tham chiếu đến users.id
  rating TINYINT UNSIGNED CHECK (rating BETWEEN 1 AND 5),  -- Đánh giá từ 1 đến 5
  review_text TEXT,                               -- Nội dung đánh giá
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo đánh giá
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Thời gian cập nhật
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,  -- Xóa đánh giá khi khóa ngoại bị xóa
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE       -- Xóa đánh giá khi khóa ngoại bị xóa
);

-- Thêm dữ liệu vào bảng courses
INSERT INTO courses (title, description, price, level, category, total_lessons, image, intro_video_url)
VALUES
('Beginner JavaScript', 'Learn the basics of JavaScript from scratch.', 499000, 'beginner', 'Programming', 10, 'javascript.jpg', 'https://example.com/intro-js.mp4'),
('Intermediate Python', 'Deepen your Python knowledge with this intermediate course.', 799000, 'intermediate', 'Programming', 8, 'python.jpg', 'https://example.com/intro-python.mp4'),
('Advanced Data Science', 'Master advanced data science concepts and techniques.', 999000, 'advanced', 'Data Science', 12, 'data_science.jpg', 'https://example.com/intro-ds.mp4');

-- Thêm dữ liệu vào bảng modules
INSERT INTO modules (course_id, title, order_index)
VALUES
(5, 'Introduction to JavaScript', 1),
(5, 'JavaScript Variables and Data Types', 2),
(2, 'Python Functions and Modules', 1),
(2, 'Working with Files in Python', 2),
(24, 'Data Processing in Data Science', 1),
(24, 'Machine Learning Models', 2);

-- Thêm dữ liệu vào bảng lessons
INSERT INTO lessons (course_id, module_id, title, content, description, video_url, order_index)
VALUES
(5, 1, 'JavaScript Introduction', 'Introduction to JavaScript content...', 'Learn the basics of JavaScript.', 'https://example.com/js-intro.mp4', 1),
(5, 8, 'JavaScript Variables', 'Understanding JavaScript variables...', 'Learn about variables in JavaScript.', 'https://example.com/js-variables.mp4', 2),
(2, 9, 'Python Functions', 'In-depth look at Python functions...', 'Learn how to use functions in Python.', 'https://example.com/python-functions.mp4', 1),
(2, 10, 'Python File Handling', 'Handling files with Python...', 'Learn to work with files in Python.', 'https://example.com/python-files.mp4', 2),
(24, 11, 'Data Processing Techniques', 'Techniques for data processing...', 'Advanced techniques in data processing.', 'https://example.com/data-processing.mp4', 1),
(24, 12, 'Introduction to Machine Learning', 'Introductory content on ML...', 'Overview of machine learning models.', 'https://example.com/ml-intro.mp4', 2);
