import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import RolePermission from "../models/RolePermission.js";

/**
 * Middleware to check user role against allowed roles
 * @param  {...string} roles Allowed roles e.g. 'admin', 'user'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to proceed.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
      });
    }

    next();
  };
};

/**
 * Middleware to ensure user is author of post OR is an admin
 */
export const checkPostOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    const isAuthor = post.author.toString() === (req.user.id || req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are only allowed to modify your own posts.",
      });
    }

    req.post = post;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure user is author of comment OR is an admin
 */
export const checkCommentOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isAuthor = comment.author.toString() === (req.user.id || req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are only allowed to modify your own comments.",
      });
    }

    req.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
};

import RoleMaster from "../models/RoleMaster.js";

/**
 * Middleware to check dynamic feature-level permission (create, view, update, delete)
 * @param {string} feature Feature key e.g. 'posts', 'users', 'comments'
 * @param {string} action Action key: 'create' | 'view' | 'update' | 'delete'
 */
export const checkFeaturePermission = (feature, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Please log in to proceed.",
        });
      }

      let roleDoc = null;
      if (req.user.role_id) {
        roleDoc = await RoleMaster.findById(req.user.role_id);
      }
      if (!roleDoc && req.user.role) {
        roleDoc = await RoleMaster.findOne({ code: req.user.role.toLowerCase() });
      }

      if (roleDoc && Array.isArray(roleDoc.permissions)) {
        const featPerm = roleDoc.permissions.find(
          (p) => p.feature.toLowerCase() === feature.toLowerCase()
        );
        if (featPerm) {
          const isAllowed = !!featPerm[action];
          if (!isAllowed) {
            return res.status(403).json({
              success: false,
              message: `Forbidden: Role '${roleDoc.name}' does not have '${action}' permission for '${feature}'.`,
            });
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  authorizeRoles,
  checkPostOwnership,
  checkCommentOwnership,
  checkFeaturePermission,
};
