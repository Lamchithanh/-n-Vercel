const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/AccountSettingsController");
const { authMiddleware } = require("../middleware/auth");

// Update user route - no validation middleware
router.put("/:id", authMiddleware, updateProfile);

module.exports = router;
