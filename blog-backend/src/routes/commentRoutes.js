import express from "express";
import CommentController from "../http/controllers/commentController.js";
import { verifyToken } from "../http/middlewares/authenticateCheck.js";
import { checkCommentOwnership } from "../http/middlewares/rbacCheck.js";
import {
  createCommentSchema,
  updateCommentSchema,
  validateCommentRequest,
} from "../http/validators/commentValidator.js";

const router = express.Router();

// Get comments for a post (public)
router.get("/post/:postId", CommentController.getCommentsByPost.bind(CommentController));

// Create a comment on a post (Authenticated user)
router.post(
  "/post/:postId",
  verifyToken,
  validateCommentRequest(createCommentSchema),
  CommentController.createComment.bind(CommentController)
);

// Update comment (Author or Admin)
router.put(
  "/:id",
  verifyToken,
  checkCommentOwnership,
  validateCommentRequest(updateCommentSchema),
  CommentController.updateComment.bind(CommentController)
);

// Delete comment (Author or Admin)
router.delete(
  "/:id",
  verifyToken,
  checkCommentOwnership,
  CommentController.deleteComment.bind(CommentController)
);

export default router;
