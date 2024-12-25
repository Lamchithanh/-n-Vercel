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
  is_first_login BOOLEAN DEFAULT TRUE,
  reset_token_expiry TIMESTAMP,
  isLocked TINYINT(1) DEFAULT 0,
  lockReason VARCHAR(255) DEFAULT NULL,
  lockedAt TIMESTAMP DEFAULT NULL,
  lockedUntil TIMESTAMP DEFAULT NULL,
  total_coupon_used INT DEFAULT 0,
  last_coupon_used_at TIMESTAMP,
  favorite_coupons JSON,
  google_id VARCHAR(255) UNIQUE NULL,
 google_name VARCHAR(255) NULL,
 google_email VARCHAR(100) UNIQUE NULL,
  coupon_notification_enabled BOOLEAN DEFAULT TRUE,
  total_savings DECIMAL(10,2) DEFAULT 0.00,
  CONSTRAINT chk_locked CHECK (isLocked IN (0,1))
);

ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT;

-- Bảng Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id BIGINT UNSIGNED,
  price INT NOT NULL,
  discount_price DECIMAL(10, 2) DEFAULT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_lessons INT DEFAULT 0,
  image VARCHAR(255),
  intro_video_url VARCHAR(255),
  duration INT,
  coupon_code VARCHAR(50) DEFAULT NULL ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE courses
MODIFY COLUMN price INT NOT NULL;

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

CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    max_usage INT NOT NULL DEFAULT 1,
    min_purchase_amount DECIMAL(10,2),
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    coupon_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usage (user_id, course_id, coupon_id)
);

-- Ràng buộc để đảm bảo discount_amount không vượt quá original_amount
ALTER TABLE coupon_usage 
ADD CONSTRAINT chk_discount_amount 
CHECK (discount_amount <= original_amount);

CREATE TABLE mycoupons (
    id INT PRIMARY KEY AUTO_INCREMENT, -- ID tự tăng của bảng
    user_id BIGINT UNSIGNED NOT NULL, -- BIGINT UNSIGNED để tương thích với users.id
    coupon_id INT NOT NULL, -- ID mã giảm giá liên kết
    course_id INT, -- ID khóa học nếu mã giảm giá chỉ áp dụng cho khóa học cụ thể (có thể NULL nếu áp dụng toàn bộ)
    is_used BOOLEAN DEFAULT FALSE, -- Trạng thái sử dụng (đã dùng hay chưa)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày mã được thêm vào
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Liên kết với bảng users
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE -- Liên kết với bảng coupons
);



