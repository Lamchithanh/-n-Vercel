const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController"); // Thay đường dẫn cho đúng

// Các route cho bài học
router.get("/courses/:courseId/lessons", lessonController.getLessonsByCourseId);
router.post("/courses/:courseId/lessons", lessonController.addLesson);
router.put(
  "/courses/:courseId/lessons/:lessonId",
  lessonController.updateLesson
);
router.delete(
  "/courses/:courseId/lessons/:lessonId",
  lessonController.deleteLesson
);

module.exports = router;
