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

      return this.successWithPagination(
        res,
        result.comments,
        result,
        "Comments retrieved successfully",
        { topLevelTotal: result.topLevelTotal }
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
      const { content, parentId, replyToUser } = req.body;

      const comment = await CommentService.createComment({
        postId,
        authorId,
        content,
        parentId: parentId || null,
        replyToUser: replyToUser || null,
      });

      ActivityLogService.logActivity({
        user: req.user,
        action: parentId ? "REPLY_COMMENT" : "CREATE_COMMENT",
        details: { postId, commentId: comment._id, parentId: comment.parentId },
        req,
      });

      // Socket.io real-time notification
      try {
        if (notificationIo?.io) {
          const post = await PostService.getPostById(postId);

          // Emit to post room for dynamic live hierarchy placement
          notificationIo.io.emit(`new_comment_${postId}`, {
            comment,
            postId,
            parentId: comment.parentId,
          });

          // Targeted alert if someone replied to another user's comment
          if (
            comment.replyToUser &&
            (comment.replyToUser._id || comment.replyToUser).toString() !== authorId.toString()
          ) {
            notificationIo.sendNotificationToUser(
              comment.replyToUser._id || comment.replyToUser,
              {
                type: "COMMENT_REPLY",
                message: `${req.user.name} replied to your comment on "${post.title}"`,
                postId,
                comment,
              }
            );
          }

          // Also emit general notification
          notificationIo.io.emit("new_comment", {
            message: parentId
              ? `${req.user.name} replied on "${post.title}"`
              : `${req.user.name} commented on "${post.title}"`,
            postId,
            comment,
          });
        }
      } catch (socketErr) {
        console.warn("Socket notification warning:", socketErr.message);
      }

      return res.status(201).json({
        success: true,
        message: parentId ? "Reply posted successfully" : "Comment added successfully",
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
