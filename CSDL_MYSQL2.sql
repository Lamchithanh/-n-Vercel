-- Tạo cơ sở dữ liệu
CREATE DATABASE mydatabase;

USE mydatabase;

-- Bảng Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50)  NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') NOT NULL,
  avatar VARCHAR(255),
  bio TEXT NULL,  -- Thông tin cá nhân của người dùng
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reset_token VARCHAR(64),
  reset_token_expiry TIMESTAMP,
  isLocked TINYINT(1) DEFAULT 0,
  lockReason VARCHAR(255) DEFAULT NULL,
  lockedAt TIMESTAMP DEFAULT NULL,
  lockedUntil TIMESTAMP DEFAULT NULL,
  total_coupon_used INT DEFAULT 0,
  last_coupon_used_at TIMESTAMP,
  favorite_coupons JSON,
  coupon_notification_enabled BOOLEAN DEFAULT TRUE,
  total_savings DECIMAL(10,2) DEFAULT 0.00,
  CONSTRAINT chk_locked CHECK (isLocked IN (0,1))
);

ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT;

-- Bảng lưu lịch sử khóa tài khoản người dùng (tùy chọn)
CREATE TABLE user_lock_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED,
    action_type ENUM('LOCK', 'UNLOCK'),
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
  duration INT,
  coupon_code VARCHAR(50) DEFAULT NULL AFTER status,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
  
);

ALTER TABLE payments
ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL AFTER status;

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
  duration FLOAT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

ALTER TABLE lessons
MODIFY COLUMN duration FLOAT;


-- Bảng Enrollments (Đăng ký khóa học)
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  course_id BIGINT UNSIGNED,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);



-- Bảng Progress (Theo dõi tiến độ học tập)
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  lesson_id BIGINT UNSIGNED,
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL,
  last_watched_position INTEGER,
  total_time_watched INT DEFAULT 0,
  watched_percentage DECIMAL(5, 2) DEFAULT 0,
  first_watch_completed BOOLEAN DEFAULT FALSE,
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
   payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'ewallet') NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);


-- Bảng BlogSection (Khu vực blog hoặc bài viết)
CREATE TABLE blog_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  date DATE,
  image VARCHAR(255)
);

-- Bảng Video Progress (Theo dõi video trong các bài học)
CREATE TABLE video_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  lesson_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  module_id BIGINT UNSIGNED NOT NULL,
  watched BOOLEAN DEFAULT false,
  watched_duration INT DEFAULT 0,  -- Thêm cột watched_duration ở đây
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

CREATE TABLE certificate_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  max_usage INT DEFAULT 1,
  discount_type ENUM('percentage', 'fixed') NOT NULL
);

-- Bảng trung gian để lưu các mã giảm giá yêu thích của user
CREATE TABLE user_favorite_coupons (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    coupon_id BIGINT UNSIGNED,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_coupon (user_id, coupon_id)
);


