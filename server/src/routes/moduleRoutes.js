const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");

// Define routes without authMiddleware
router.get("/courses/:courseId/modules", moduleController.getModulesByCourse);
router.post("/modules", moduleController.createModule);
router.put("/modules/:id", moduleController.updateModule);
router.delete("/modules/:id", moduleController.deleteModule);

module.exports = router; // Ensure only 'router' is exported
