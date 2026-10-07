import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import BaseService from "./baseService.js";

class CommentService extends BaseService {
  /**
   * Create a new comment or nested reply on a post
   */
  async createComment({ postId, authorId, content, parentId = null, replyToUser = null }) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }

    let depth = 0;
    let resolvedReplyToUser = replyToUser || null;

    if (parentId) {
      const parentComment = await Comment.findOne({
        _id: parentId,
        post: postId,
        isDeleted: false,
      });

      if (!parentComment) {
        const error = new Error("Parent comment not found or has been deleted.");
        error.statusCode = 404;
        throw error;
      }

      depth = Math.min((parentComment.depth || 0) + 1, 6);
      if (!resolvedReplyToUser) {
        resolvedReplyToUser = parentComment.author;
      }
    }

    const comment = new Comment({
      post: postId,
      author: authorId,
      content,
      parentId: parentId || null,
      replyToUser: resolvedReplyToUser,
      depth,
    });

    await comment.save();
    return await Comment.findById(comment._id)
      .populate("author", "name email avatar role")
      .populate("replyToUser", "name email avatar role");
  }

  /**
   * Helper to build a nested hierarchy tree from a list of flat comments
   */
  buildCommentTree(allComments) {
    const commentMap = new Map();
    const roots = [];

    // Initialize every comment with an empty replies array
    allComments.forEach((c) => {
      c.replies = [];
      commentMap.set(c._id.toString(), c);
    });

    // Link child replies to parent comment
    allComments.forEach((c) => {
      if (c.parentId && commentMap.has(c.parentId.toString())) {
        const parent = commentMap.get(c.parentId.toString());
        parent.replies.push(c);
      } else {
        roots.push(c);
      }
    });

    // Top-level comments newest first; replies within threads chronologically
    roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const sortRepliesChronological = (item) => {
      if (item.replies && item.replies.length > 0) {
        item.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        item.replies.forEach(sortRepliesChronological);
      }
    };
    roots.forEach(sortRepliesChronological);

    return roots;
  }

  /**
   * Get comments for a post formatted in dynamic hierarchy
   */
  async getCommentsByPost(postId, { page = 1, limit = 50, hierarchical = true } = {}) {
    const query = { post: postId, isDeleted: false };

    const allComments = await Comment.find(query)
      .populate("author", "name email avatar role")
      .populate("replyToUser", "name email avatar role")
      .sort({ createdAt: 1 })
      .lean();

    const total = allComments.length;

    if (!hierarchical) {
      return {
        comments: allComments,
        total,
        page: 1,
        limit: total,
        totalPages: 1,
      };
    }

    const tree = this.buildCommentTree(allComments);

    return {
      comments: tree,
      total,
      topLevelTotal: tree.length,
      page: 1,
      limit,
      totalPages: Math.ceil(tree.length / limit) || 1,
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
    return await Comment.findById(comment._id)
      .populate("author", "name email avatar role")
      .populate("replyToUser", "name email avatar role");
  }

  /**
   * Soft delete comment and cascade to its child replies
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

    // Cascade soft-delete all nested replies to prevent orphaned threads
    await Comment.updateMany(
      { parentId: commentId },
      { isDeleted: true, deletedAt: new Date() }
    );

    return { success: true, message: "Comment and its replies deleted successfully." };
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
    // Delete any replies
    await Comment.deleteMany({ parentId: commentId });
    return { success: true, message: "Comment permanently removed." };
  }
}

export default new CommentService();
