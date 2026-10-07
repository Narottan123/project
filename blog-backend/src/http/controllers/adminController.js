import BaseController from "./baseController.js";
import AdminService from "../services/adminService.js";
import PostService from "../services/postService.js";
import CommentService from "../services/commentService.js";
import ActivityLogService from "../services/activityLogService.js";

class AdminController extends BaseController {
  /**
   * Admin dashboard aggregated metrics
   */
  async getDashboardStats(req, res, next) {
    try {
      const data = await AdminService.getDashboardStats();
      return this.success(res, data, null, "Dashboard statistics retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users
   */
  async getUsers(req, res, next) {
    try {
      const { page, limit, search, role } = req.query;
      const result = await AdminService.getUsers({ page, limit, search, role });

      return this.successWithPagination(
        res,
        result.users,
        result,
        "Users retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user details / role / status
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await AdminService.updateUser(id, req.body);

      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_UPDATE_USER",
        details: { targetUserId: id, updates: req.body },
        req,
      });

      return this.success(res, user, null, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteUser(id);

      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_DELETE_USER",
        details: { targetUserId: id },
        req,
      });

      return this.success(res, result, null, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all posts (admin view)
   */
  async getPosts(req, res, next) {
    try {
      const { page, limit, search, status, isDeleted } = req.query;
      const result = await AdminService.getAdminPosts({ page, limit, search, status, isDeleted });

      return this.successWithPagination(
        res,
        result.posts,
        result,
        "Admin posts retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore a soft-deleted post
   */
  async restorePost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await PostService.restorePost(id);

      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_RESTORE_POST",
        details: { postId: id },
        req,
      });

      return this.success(res, post, null, "Post restored successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hard delete a post
   */
  async hardDeletePost(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PostService.hardDeletePost(id);

      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_HARD_DELETE_POST",
        details: { postId: id },
        req,
      });

      return this.success(res, result, null, "Post permanently deleted");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all comments for moderation
   */
  async getComments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getAdminComments({ page, limit });

      return this.successWithPagination(
        res,
        result.comments,
        result,
        "Comments retrieved for moderation"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete comment as admin
   */
  async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CommentService.deleteComment(id);

      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_DELETE_COMMENT",
        details: { commentId: id },
        req,
      });

      return this.success(res, result, null, "Comment deleted by admin");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system activity audit logs
   */
  async getActivityLogs(req, res, next) {
    try {
      const { page, limit, action, userId } = req.query;
      const result = await ActivityLogService.getLogs({ page, limit, action, userId });

      return this.successWithPagination(
        res,
        result.logs,
        result,
        "Activity logs retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all dynamic roles from role_master
   */
  async getRoles(req, res, next) {
    try {
      const roles = await AdminService.getRoles();
      return this.success(res, roles, null, "Roles retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new dynamic role
   */
  async createRole(req, res, next) {
    try {
      const role = await AdminService.createRole(req.body);
      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_CREATE_ROLE",
        details: { roleName: role.name, roleCode: role.code },
        req,
      });
      return this.success(res, role, null, "Role created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update dynamic role
   */
  async updateRole(req, res, next) {
    try {
      const role = await AdminService.updateRole(req.params.id, req.body);
      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_UPDATE_ROLE",
        details: { roleId: req.params.id, roleName: role.name },
        req,
      });
      return this.success(res, role, null, "Role updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete dynamic role
   */
  async deleteRole(req, res, next) {
    try {
      const result = await AdminService.deleteRole(req.params.id);
      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_DELETE_ROLE",
        details: { roleId: req.params.id },
        req,
      });
      return this.success(res, result, null, "Role deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dynamic role permissions
   */
  async getPermissions(req, res, next) {
    try {
      const permissions = await AdminService.getPermissions();
      return this.success(res, permissions, null, "Role permissions retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update role permissions dynamically
   */
  async updatePermissions(req, res, next) {
    try {
      let items = req.body;
      if (Array.isArray(req.body.permissions)) {
        items = req.body.permissions;
      } else if (Array.isArray(req.body.items)) {
        items = req.body.items;
      } else if (Array.isArray(req.body)) {
        items = req.body;
      } else if (req.body && req.body.role && req.body.feature) {
        items = [req.body];
      }
      const updated = await AdminService.updatePermissions(items);

      ActivityLogService.logActivity({
        user: req.user,
        action: "ADMIN_UPDATE_ROLE_PERMISSIONS",
        details: { count: Array.isArray(items) ? items.length : 1 },
        req,
      });

      return this.success(res, updated, null, "Role permissions updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
