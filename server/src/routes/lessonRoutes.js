const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");

router.get("/lessons", lessonController.getAllLessons);
// Route để lấy bài học theo module
router.get("/modules/:moduleId/lessons", lessonController.getLessonsByModuleId);

// Các route khác
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
