const { google } = require("googleapis");
const pool = require("../config/pool");
const { getVideoDuration } = require("../utils/youtubeUtils");
const { convertTimeToMinutes } = require("../utils/durationUtils");

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

const convertDurationToMinutes = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return Math.round(hours * 60 + minutes + seconds / 60);
};

// Controller để lấy thời lượng video
exports.getVideoDuration = async (req, res) => {
  const { videoUrl } = req.query;

  try {
    const videoId = getVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const response = await youtube.videos.list({
      part: "contentDetails",
      id: videoId,
    });

    if (!response.data.items || !response.data.items[0]) {
      return res.status(404).json({ error: "Video not found" });
    }

    const duration = response.data.items[0].contentDetails.duration;
    const durationInMinutes = convertDurationToMinutes(duration);

    res.json({ duration: durationInMinutes });
  } catch (error) {
    console.error("Error fetching video duration:", error);
    res.status(500).json({ error: "Failed to fetch video duration" });
  }
};

// Controller để lấy tổng thời lượng của module
exports.getModuleDuration = async (req, res) => {
  const { moduleId } = req.params;

  try {
    const [result] = await pool.execute(
      "SELECT SUM(duration) as total_duration FROM lessons WHERE module_id = ?",
      [moduleId]
    );

    res.json({ totalDuration: result[0].total_duration || 0 });
  } catch (error) {
    console.error("Error calculating module duration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller để lấy tổng thời lượng của khóa học
exports.getCourseDuration = async (req, res) => {
  const { courseId } = req.params;

  try {
    const [result] = await pool.execute(
      `SELECT SUM(l.duration) as total_duration 
       FROM lessons l 
       JOIN modules m ON l.module_id = m.id 
       WHERE m.course_id = ?`,
      [courseId]
    );

    res.json({ totalDuration: result[0].total_duration || 0 });
  } catch (error) {
    console.error("Error calculating course duration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllLessons = async (req, res) => {
  try {
    const { courseId } = req.query;
    const [lessons] = await pool.query(
      `SELECT lessons.*, modules.title as module_name 
       FROM lessons 
       LEFT JOIN modules ON lessons.module_id = modules.id 
       WHERE lessons.course_id = ? 
       ORDER BY lessons.order_index`,
      [courseId]
    );
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching all lessons:", error);
    res.status(500).json({ error: "Unable to fetch lessons" });
  }
};

// Trong hàm getLessonsByModuleId
exports.getLessonsByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const [lessons] = await pool.query(
      `SELECT lessons.*, modules.title as module_name 
       FROM lessons 
       LEFT JOIN modules ON lessons.module_id = modules.id 
       WHERE lessons.module_id = ? 
       ORDER BY lessons.order_index`,
      [moduleId]
    );
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Unable to fetch lessons" });
  }
};

// Thêm bài học mới
exports.addLesson = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { courseId } = req.params;
    const { module_id, title, content, description, video_url, order_index } =
      req.body;

    // Increase order_index of existing lessons
    await connection.query(
      `UPDATE lessons 
       SET order_index = order_index + 1 
       WHERE course_id = ? AND order_index >= ?`,
      [courseId, order_index]
    );

    // Get video duration if URL provided
    let duration = null;
    if (video_url) {
      duration = await getVideoDuration(video_url, youtube);
    }

    // Insert new lesson
    const [result] = await connection.query(
      `INSERT INTO lessons 
       (course_id, module_id, title, content, description, video_url, duration, order_index) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        module_id,
        title,
        content,
        description,
        video_url,
        duration,
        order_index,
      ]
    );

    // Commit transaction
    await connection.commit();

    const [newLesson] = await pool.query("SELECT * FROM lessons WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(newLesson[0]);
  } catch (error) {
    await connection.rollback();
    console.error("Error adding lesson:", error);
    res.status(500).json({ error: "Unable to add lesson" });
  } finally {
    connection.release();
  }
};

// Cập nhật hàm updateLesson
exports.updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { module_id, title, content, description, video_url, order_index } =
      req.body;

    // Bắt đầu transaction để đảm bảo tính nhất quán của dữ liệu
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current lesson
      const [currentLesson] = await connection.query(
        "SELECT order_index FROM lessons WHERE id = ? AND course_id = ?",
        [lessonId, courseId]
      );

      if (currentLesson.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Lesson not found" });
      }

      const oldOrderIndex = currentLesson[0].order_index;
      const newOrderIndex = order_index;

      // Update other lessons' order if needed
      if (oldOrderIndex !== newOrderIndex) {
        if (oldOrderIndex < newOrderIndex) {
          // Moving down - decrease order_index for lessons in between
          await connection.query(
            `UPDATE lessons 
             SET order_index = order_index - 1 
             WHERE course_id = ? 
             AND order_index > ? 
             AND order_index <= ?
             AND id != ?`,
            [courseId, oldOrderIndex, newOrderIndex, lessonId]
          );
        } else {
          // Moving up - increase order_index for lessons in between
          await connection.query(
            `UPDATE lessons 
             SET order_index = order_index + 1 
             WHERE course_id = ? 
             AND order_index >= ? 
             AND order_index < ?
             AND id != ?`,
            [courseId, newOrderIndex, oldOrderIndex, lessonId]
          );
        }
      }

      // Get new video duration if URL changed
      let duration = null;
      if (video_url) {
        duration = await getVideoDuration(video_url, youtube);
      }

      // Update the lesson
      await connection.query(
        `UPDATE lessons 
         SET module_id = ?, title = ?, content = ?, description = ?, 
             video_url = ?, duration = ?, order_index = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND course_id = ?`,
        [
          module_id,
          title,
          content,
          description,
          video_url,
          duration,
          order_index,
          lessonId,
          courseId,
        ]
      );

      // Commit transaction
      await connection.commit();

      // Get updated lesson
      const [lesson] = await pool.query("SELECT * FROM lessons WHERE id = ?", [
        lessonId,
      ]);

      res.json(lesson[0]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Unable to update lesson" });
  }
};

// Xóa bài học
exports.deleteLesson = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { courseId, lessonId } = req.params;

    // Get current lesson order_index
    const [currentLesson] = await connection.query(
      "SELECT order_index FROM lessons WHERE id = ? AND course_id = ?",
      [lessonId, courseId]
    );

    if (currentLesson.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Lesson not found" });
    }

    const currentOrderIndex = currentLesson[0].order_index;

    // Delete the lesson
    await connection.query(
      "DELETE FROM lessons WHERE id = ? AND course_id = ?",
      [lessonId, courseId]
    );

    // Update order_index for remaining lessons
    await connection.query(
      `UPDATE lessons 
       SET order_index = order_index - 1 
       WHERE course_id = ? AND order_index > ?`,
      [courseId, currentOrderIndex]
    );

    // Commit transaction
    await connection.commit();

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Unable to delete lesson" });
  } finally {
    connection.release();
  }
};
