import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import BaseService from "./baseService.js";

class CommentService extends BaseService {
  /**
   * Create a new comment on a post
   */
  async createComment({ postId, authorId, content }) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }

    const comment = new Comment({
      post: postId,
      author: authorId,
      content,
    });

    await comment.save();
    return await Comment.findById(comment._id).populate("author", "name email avatar role");
  }

  /**
   * Get all comments for a post (with pagination)
   */
  async getCommentsByPost(postId, { page = 1, limit = 20 } = {}) {
    const query = { post: postId, isDeleted: false };
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate("author", "name email avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Comment.countDocuments(query),
    ]);

    return {
      comments,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  /**
   * Update comment content
   */
  async updateComment(commentId, content) {
    const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
    if (!comment) {
      const error = new Error("Comment not found.");
      error.statusCode = 404;
      throw error;
    }

    comment.content = content;
    await comment.save();
    return await Comment.findById(comment._id).populate("author", "name email avatar role");
  }

  /**
   * Soft delete comment
   */
  async deleteComment(commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      const error = new Error("Comment not found.");
      error.statusCode = 404;
      throw error;
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();
    return { success: true, message: "Comment deleted successfully." };
  }

  /**
   * Hard delete comment (admin only)
   */
  async hardDeleteComment(commentId) {
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      const error = new Error("Comment not found.");
      error.statusCode = 404;
      throw error;
    }
    return { success: true, message: "Comment permanently removed." };
  }
}

export default new CommentService();
