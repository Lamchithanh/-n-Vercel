const pool = require("../config/pool");

// Lấy tất cả khóa học
exports.getAllCourses = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM courses");
        res.status(200).json(results);
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).json({
            error: "Internal server error",
            message: err.message,
        });
    }
};

// Hàm lấy khóa học theo ID
exports.getCourseById = async (req, res) => {
    const courseId = req.params.id;
    try {
        const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (course.length > 0) {
            res.json(course[0]);
        } else {
            res.status(404).json({ message: 'Khóa học không tìm thấy.' });
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin khóa học.' });
    }
};

// Thêm khóa học mới
exports.addCourse = (req, res) => {
    const { title, description, instructor_id, price, level, category } =
        req.body;

    const query = `
        INSERT INTO courses (title, description, instructor_id, price, level, category)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [title, description, instructor_id, price, level, category];

    pool.query(query, values, (err, results) => {
        if (err) {
            console.error("Error adding course:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(201).json({
            id: results.insertId,
            title,
            description,
            instructor_id,
            price,
            level,
            category,
        }); // Trả về khóa học vừa được thêm
    });
};

// Cập nhật thông tin khóa học
exports.updateCourse = (req, res) => {
    const { id } = req.params; // Thay đổi ở đây
    const { title, description, instructor_id, price, level, category } =
        req.body;

    const query = `
        UPDATE courses
        SET title = ?, description = ?, instructor_id = ?, price = ?, level = ?, category = ?
        WHERE id = ?
    `;

    const values = [
        title,
        description,
        instructor_id,
        price,
        level,
        category,
        id, // Sử dụng id ở đây
    ];

    pool.query(query, values, (err, results) => {
        if (err) {
            console.error("Error updating course:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Lấy dữ liệu khóa học sau khi đã cập nhật
        pool.query(
            "SELECT * FROM courses WHERE id = ?",
            [id], // Sử dụng id ở đây
            (err, updatedResults) => {
                if (err) {
                    console.error("Error fetching updated course:", err);
                    return res
                        .status(500)
                        .json({ error: "Internal server error" });
                }
                res.json(updatedResults[0]); // Trả về khóa học đã được cập nhật
            }
        );
    });
};

// Xóa khóa học
exports.deleteCourse = (req, res) => {
    const { courseId } = req.params;

    const query = `DELETE FROM courses WHERE id = ?`;

    pool.query(query, [courseId], (err, results) => {
        if (err) {
            console.error("Error deleting course:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({ message: "Course deleted successfully" });
    });
};

// Thêm bài học vào khóa học
exports.addLesson = (req, res) => {
    const { courseId } = req.params;
    const { title, content, video_url, order_index } = req.body;

    const query = `
        INSERT INTO lessons (course_id, title, content, video_url, order_index)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [courseId, title, content, video_url, order_index];

    pool.query(query, values, (err, results) => {
        if (err) {
            console.error("Error adding lesson:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(201).json(results); // Trả về bài học vừa được thêm
    });
};

// Lấy danh sách bài học của khóa học
exports.getLessons = (req, res) => {
    const { courseId } = req.params;

    pool.query(
        "SELECT * FROM lessons WHERE course_id = ?",
        [courseId],
        (err, results) => {
            if (err) {
                console.error("Error fetching lessons:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.json(results); // Trả về danh sách bài học
        }
    );
};
