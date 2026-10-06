import BaseController from "./baseController.js";
import CommentService from "../services/commentService.js";
import PostService from "../services/postService.js";
import ActivityLogService from "../services/activityLogService.js";
import notificationIo from "../../socket/notification.js";

class CommentController extends BaseController {
  /**
   * Get comments for a post
   */
  async getCommentsByPost(req, res, next) {
    try {
      const { postId } = req.params;
      const { page, limit } = req.query;

      const result = await CommentService.getCommentsByPost(postId, { page, limit });

      return this.success(
        res,
        result.comments,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        "Comments retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a comment on a post
   */
  async createComment(req, res, next) {
    try {
      const { postId } = req.params;
      const authorId = req.user.id || req.user._id;
      const { content } = req.body;

      const comment = await CommentService.createComment({
        postId,
        authorId,
        content,
      });

      ActivityLogService.logActivity({
        user: req.user,
        action: "CREATE_COMMENT",
        details: { postId, commentId: comment._id },
        req,
      });

      // Socket.io real-time notification
      try {
        if (notificationIo?.io) {
          const post = await PostService.getPostById(postId);
          notificationIo.io.emit(`new_comment_${postId}`, {
            comment,
            postId,
          });

          // Also emit general notification
          notificationIo.io.emit("new_comment", {
            message: `${req.user.name} commented on "${post.title}"`,
            postId,
            comment,
          });
        }
      } catch (socketErr) {
        console.warn("Socket notification warning:", socketErr.message);
      }

      return res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update comment content
   */
  async updateComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const updated = await CommentService.updateComment(id, content);

      ActivityLogService.logActivity({
        user: req.user,
        action: "UPDATE_COMMENT",
        details: { commentId: id },
        req,
      });

      return this.success(res, updated, null, "Comment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete comment (Author or Admin)
   */
  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CommentService.deleteComment(id);

      ActivityLogService.logActivity({
        user: req.user,
        action: "DELETE_COMMENT",
        details: { commentId: id },
        req,
      });

      return this.success(res, result, null, "Comment deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
