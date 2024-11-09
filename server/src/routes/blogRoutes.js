const express = require("express");
const {
  getAllPosts,
  getPostById,
  addPost,
  updatePost,
  deletePost,
} = require("../controllers/blogController");

const router = express.Router();

// Routes cho bài viết
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", addPost);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

module.exports = router;
