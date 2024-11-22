const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const favoriteController = require("../controllers/favoriteController");

router.post("/favorites", authMiddleware, favoriteController.addFavorite);
router.delete(
  "/favorites/:couponId",
  authMiddleware,
  favoriteController.removeFavorite
);
router.get("/favorites", authMiddleware, favoriteController.getFavorites);
router.get(
  "/favorites/check/:couponId",
  authMiddleware,
  favoriteController.checkFavorite
);

module.exports = router; // Đảm bảo export đúng
