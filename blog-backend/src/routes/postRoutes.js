import express from "express";
import PostController from "../http/controllers/postController.js";
import { verifyToken } from "../http/middlewares/authenticateCheck.js";
import { checkPostOwnership } from "../http/middlewares/rbacCheck.js";
import {
  createPostSchema,
  updatePostSchema,
  validatePostRequest,
} from "../http/validators/postValidator.js";

const router = express.Router();

// Public routes
router.get("/", PostController.getPosts.bind(PostController));
router.get("/categories", PostController.getCategories.bind(PostController));
router.get("/tags", PostController.getTags.bind(PostController));
router.get("/slug/:slug", PostController.getPostBySlug.bind(PostController));

// Authenticated user's own posts
router.get("/my-posts", verifyToken, PostController.getMyPosts.bind(PostController));

// Get post by ID (public)
router.get("/:id", PostController.getPostById.bind(PostController));

// Create post (Authenticated user)
router.post(
  "/",
  verifyToken,
  validatePostRequest(createPostSchema),
  PostController.createPost.bind(PostController)
);

// Update post (Author or Admin)
router.put(
  "/:id",
  verifyToken,
  checkPostOwnership,
  validatePostRequest(updatePostSchema),
  PostController.updatePost.bind(PostController)
);

// Soft delete post (Author or Admin)
router.delete(
  "/:id",
  verifyToken,
  checkPostOwnership,
  PostController.deletePost.bind(PostController)
);

export default router;
