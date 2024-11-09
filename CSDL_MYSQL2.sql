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
  reset_token_expiry TIMESTAMP,  -- Thay đổi từ BIGINT sang TIMESTAMP
  isLocked TINYINT(1) DEFAULT 0,  -- Thay đổi từ BOOLEAN sang TINYINT(1)
  lockReason VARCHAR(255) DEFAULT NULL,
  lockedAt TIMESTAMP DEFAULT NULL,  -- Thay đổi từ DATETIME sang TIMESTAMP
  lockedUntil TIMESTAMP DEFAULT NULL,  -- Thay đổi từ DATETIME sang TIMESTAMP
  CONSTRAINT chk_locked CHECK (isLocked IN (0,1))  -- Thêm ràng buộc cho isLocked
);

-- Bảng lưu lịch sử khóa (tùy chọn)
CREATE TABLE user_lock_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId BIGINT UNSIGNED,
    actionType ENUM('LOCK', 'UNLOCK'),
    reason VARCHAR(255),
    createdAt DATETIME,
    FOREIGN KEY (userId) REFERENCES users(id)
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
  duration INT,  -- Thêm cột cho thời gian của khóa học
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng Modules (Phân mục trong khóa học)
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  course_id BIGINT UNSIGNED,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Lessons (Bài học trong mỗi module)
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id BIGINT UNSIGNED,
  module_id BIGINT UNSIGNED,
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

-- Bảng Enrollments (Đăng ký khóa học)
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  course_id BIGINT UNSIGNED,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Progress Tracking (Theo dõi tiến độ học tập)
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

-- Bảng Certificates (Chứng chỉ khóa học)
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  course_id BIGINT UNSIGNED,
  issued_at DATE,
  certificate_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Course Reviews (Đánh giá khóa học)
CREATE TABLE course_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Payments (Lịch sử thanh toán)
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

-- Bảng Lesson Progress (Tiến độ bài học của người dùng)
CREATE TABLE lesson_progress (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NOT NULL,
  status ENUM('started', 'completed') DEFAULT 'started',
  progress_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_progress (user_id, lesson_id)
);

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;

DELETE FROM lesson_progress WHERE user_id = 1;
DELETE FROM payments;
DELETE FROM course_reviews;
DELETE FROM certificates;
DELETE FROM progress;
DELETE FROM enrollments;
DELETE FROM lessons;
DELETE FROM modules;
DELETE FROM courses;
DELETE FROM user_lock_history;
DELETE FROM users WHERE id != 1;

