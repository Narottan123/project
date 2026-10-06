import BaseController from "./baseController.js";
import PostService from "../services/postService.js";
import ActivityLogService from "../services/activityLogService.js";
import notificationIo from "../../socket/notification.js";

class PostController extends BaseController {
  /**
   * Get all published posts (public)
   */
  async getPosts(req, res, next) {
    try {
      const { page, limit, category, tag, search, author } = req.query;
      const result = await PostService.getPosts({
        page,
        limit,
        category,
        tag,
        search,
        author,
        status: "published",
        includeDeleted: false,
      });

      return this.success(
        res,
        result.posts,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        "Posts retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single post by slug
   */
  async getPostBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const post = await PostService.getPostBySlug(slug);
      return this.success(res, post, null, "Post details retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const post = await PostService.getPostById(id);
      return this.success(res, post, null, "Post details retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get posts authored by the logged-in user
   */
  async getMyPosts(req, res, next) {
    try {
      const userId = req.user.id || req.user._id;
      const { page, limit, status } = req.query;

      const result = await PostService.getPosts({
        page,
        limit,
        author: userId,
        status: status || "all",
        includeDeleted: false,
      });

      return this.success(
        res,
        result.posts,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        "User posts retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new post
   */
  async createPost(req, res, next) {
    try {
      const authorId = req.user.id || req.user._id;
      const post = await PostService.createPost(req.body, authorId);

      // Log activity
      ActivityLogService.logActivity({
        user: req.user,
        action: "CREATE_POST",
        details: { postId: post._id, title: post.title, slug: post.slug },
        req,
      });

      // Emit real-time notification via Socket.io
      try {
        if (notificationIo?.io) {
          notificationIo.io.emit("new_post", {
            message: `New post published: "${post.title}" by ${req.user.name}`,
            post: {
              _id: post._id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              author: post.author,
            },
          });
        }
      } catch (socketErr) {
        console.warn("Socket notification warning:", socketErr.message);
      }

      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing post
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const updatedPost = await PostService.updatePost(id, req.body);

      ActivityLogService.logActivity({
        user: req.user,
        action: "UPDATE_POST",
        details: { postId: id, title: updatedPost.title },
        req,
      });

      return this.success(res, updatedPost, null, "Post updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete a post
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PostService.softDeletePost(id);

      ActivityLogService.logActivity({
        user: req.user,
        action: "DELETE_POST",
        details: { postId: id },
        req,
      });

      return this.success(res, result, null, "Post soft-deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(req, res, next) {
    try {
      const categories = await PostService.getCategories();
      return this.success(res, categories, null, "Categories retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tags
   */
  async getTags(req, res, next) {
    try {
      const tags = await PostService.getTags();
      return this.success(res, tags, null, "Tags retrieved");
    } catch (error) {
      next(error);
    }
  }
}

export default new PostController();
