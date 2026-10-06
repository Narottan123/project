import Post from "../models/Post.js";
import BaseService from "./baseService.js";

/**
 * Generate a URL-friendly slug from title
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing -
};

class PostService extends BaseService {
  /**
   * Helper to ensure unique slug
   */
  async generateUniqueSlug(title, existingId = null) {
    let baseSlug = slugify(title) || "post";
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query = { slug };
      if (existingId) {
        query._id = { $ne: existingId };
      }
      const existing = await Post.findOne(query);
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Create a new post
   */
  async createPost(postData, authorId) {
    const slug = await this.generateUniqueSlug(postData.title);

    let parsedTags = postData.tags || [];
    if (typeof parsedTags === "string") {
      parsedTags = parsedTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const post = new Post({
      title: postData.title,
      slug,
      content: postData.content,
      excerpt: postData.excerpt || postData.content.replace(/<[^>]*>?/gm, "").slice(0, 150) + "...",
      author: authorId,
      category: postData.category || "General",
      tags: parsedTags,
      coverImage: postData.coverImage || "",
      status: postData.status || "published",
    });

    await post.save();
    return await Post.findById(post._id).populate("author", "name email avatar role");
  }

  /**
   * Get paginated public posts with filtering and search
   */
  async getPosts({
    page = 1,
    limit = 10,
    category,
    tag,
    search,
    author,
    status = "published",
    includeDeleted = false,
  } = {}) {
    const query = {};

    if (!includeDeleted) {
      query.isDeleted = false;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "All") {
      query.category = new RegExp(`^${category}$`, "i");
    }

    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, "i")] };
    }

    if (author) {
      query.author = author;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { content: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return {
      posts,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  /**
   * Get post by slug (and increment views)
   */
  async getPostBySlug(slug) {
    const post = await Post.findOneAndUpdate(
      { slug, isDeleted: false },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "name email avatar role bio");

    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }

    return post;
  }

  /**
   * Get post by ID
   */
  async getPostById(id, includeDeleted = false) {
    const query = { _id: id };
    if (!includeDeleted) query.isDeleted = false;

    const post = await Post.findOne(query).populate("author", "name email avatar role");
    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }
    return post;
  }

  /**
   * Update an existing post
   */
  async updatePost(id, updateData) {
    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.title && updateData.title !== post.title) {
      post.title = updateData.title;
      post.slug = await this.generateUniqueSlug(updateData.title, id);
    }

    if (updateData.content !== undefined) post.content = updateData.content;
    if (updateData.excerpt !== undefined) post.excerpt = updateData.excerpt;
    if (updateData.category !== undefined) post.category = updateData.category;
    if (updateData.coverImage !== undefined) post.coverImage = updateData.coverImage;
    if (updateData.status !== undefined) post.status = updateData.status;

    if (updateData.tags !== undefined) {
      let parsedTags = updateData.tags;
      if (typeof parsedTags === "string") {
        parsedTags = parsedTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
      post.tags = parsedTags;
    }

    await post.save();
    return await Post.findById(post._id).populate("author", "name email avatar role");
  }

  /**
   * Soft delete a post
   */
  async softDeletePost(id) {
    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();
    return { success: true, message: "Post successfully soft-deleted." };
  }

  /**
   * Restore soft-deleted post (Admin only)
   */
  async restorePost(id) {
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }

    post.isDeleted = false;
    post.deletedAt = null;
    await post.save();
    return await Post.findById(id).populate("author", "name email avatar role");
  }

  /**
   * Permanently delete a post (Admin only)
   */
  async hardDeletePost(id) {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      throw error;
    }
    return { success: true, message: "Post permanently deleted." };
  }

  /**
   * Get all distinct categories
   */
  async getCategories() {
    return await Post.distinct("category", { isDeleted: false, status: "published" });
  }

  /**
   * Get all distinct tags
   */
  async getTags() {
    return await Post.distinct("tags", { isDeleted: false, status: "published" });
  }
}

export default new PostService();
