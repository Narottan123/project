import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import ActivityLog from "../models/ActivityLog.js";
import RolePermission from "../models/RolePermission.js";
import RoleMaster from "../models/RoleMaster.js";
import BaseService from "./baseService.js";

const DEFAULT_FEATURES = [
  { feature: "users", featureLabel: "User Management" },
  { feature: "posts", featureLabel: "Blog Articles" },
  { feature: "comments", featureLabel: "Comments & Discussions" },
  { feature: "categories", featureLabel: "Categories & Tags" },
  { feature: "logs", featureLabel: "Security & Audit Logs" },
];

class AdminService extends BaseService {
  /**
   * Initialize default roles in role_master collection and sync with User collection
   */
  async initRoleMaster() {
    const count = await RoleMaster.countDocuments();
    if (count === 0) {
      const defaultRoles = [
        {
          name: "Admin",
          code: "admin",
          description: "Full system administration access",
          isSystem: true,
          isActive: true,
          permissions: [
            { feature: "users", featureLabel: "User Management", create: true, view: true, update: true, delete: true },
            { feature: "posts", featureLabel: "Blog Articles", create: true, view: true, update: true, delete: true },
            { feature: "comments", featureLabel: "Comments & Discussions", create: true, view: true, update: true, delete: true },
            { feature: "categories", featureLabel: "Categories & Tags", create: true, view: true, update: true, delete: true },
            { feature: "logs", featureLabel: "Security & Audit Logs", create: false, view: true, update: false, delete: true },
          ],
        },
        {
          name: "User",
          code: "user",
          description: "Standard registered user access",
          isSystem: true,
          isActive: true,
          permissions: [
            { feature: "users", featureLabel: "User Management", create: false, view: true, update: false, delete: false },
            { feature: "posts", featureLabel: "Blog Articles", create: true, view: true, update: true, delete: true },
            { feature: "comments", featureLabel: "Comments & Discussions", create: true, view: true, update: true, delete: true },
            { feature: "categories", featureLabel: "Categories & Tags", create: false, view: true, update: false, delete: false },
            { feature: "logs", featureLabel: "Security & Audit Logs", create: false, view: false, update: false, delete: false },
          ],
        },
      ];

      await RoleMaster.insertMany(defaultRoles);
    }

    // Sync existing users who do not have role_id yet
    const [adminRole, userRole] = await Promise.all([
      RoleMaster.findOne({ code: "admin" }),
      RoleMaster.findOne({ code: "user" }),
    ]);

    if (adminRole) {
      await User.updateMany(
        { role: "admin", $or: [{ role_id: null }, { role_id: { $exists: false } }] },
        { role_id: adminRole._id }
      );
    }
    if (userRole) {
      await User.updateMany(
        { role: "user", $or: [{ role_id: null }, { role_id: { $exists: false } }] },
        { role_id: userRole._id }
      );
    }
  }

  /**
   * Get admin dashboard aggregated metrics
   */
  async getDashboardStats() {
    await this.initRoleMaster();
    const [
      totalUsers,
      totalActiveUsers,
      totalAdmins,
      totalPosts,
      totalPublishedPosts,
      totalDeletedPosts,
      totalComments,
      recentUsers,
      recentPosts,
      recentComments,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
      Post.countDocuments(),
      Post.countDocuments({ isDeleted: false, status: "published" }),
      Post.countDocuments({ isDeleted: true }),
      Comment.countDocuments({ isDeleted: false }),
      User.find().populate("role_id").sort({ createdAt: -1 }).limit(5).lean(),
      Post.find().populate("author", "name email").sort({ createdAt: -1 }).limit(5).lean(),
      Comment.find().populate("author", "name email").populate("post", "title slug").sort({ createdAt: -1 }).limit(5).lean(),
      ActivityLog.find().populate("user", "name email role").sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return {
      stats: {
        totalUsers,
        totalActiveUsers,
        totalAdmins,
        totalPosts,
        totalPublishedPosts,
        totalDeletedPosts,
        totalComments,
      },
      recentUsers,
      recentPosts,
      recentComments,
      recentActivities,
    };
  }

  /**
   * Get all users with pagination, role filter, search, populated with role_id
   */
  async getUsers({ page = 1, limit = 10, search = "", role = "" } = {}) {
    await this.initRoleMaster();
    const query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate("role_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  /**
   * Update user details (role, role_id, active status)
   */
  async updateUser(userId, { role, role_id, isActive, bio, name }) {
    await this.initRoleMaster();
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    if (role_id) {
      const roleDoc = await RoleMaster.findById(role_id);
      if (roleDoc) {
        user.role_id = roleDoc._id;
        user.role = roleDoc.code;
      }
    } else if (role) {
      const roleDoc = await RoleMaster.findOne({ code: role.toLowerCase() });
      if (roleDoc) {
        user.role_id = roleDoc._id;
        user.role = roleDoc.code;
      } else {
        user.role = role;
      }
    }

    if (typeof isActive === "boolean") user.isActive = isActive;
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    await user.populate("role_id");
    return user.toJSON();
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    // Optionally clean up or soft-delete user's posts
    await Post.updateMany({ author: userId }, { isDeleted: true, deletedAt: new Date() });
    return { success: true, message: "User and associated posts deleted successfully." };
  }

  /**
   * Get all posts for admin (including deleted)
   */
  async getAdminPosts({ page = 1, limit = 10, search = "", status = "all", isDeleted = "all" } = {}) {
    const query = {};

    if (isDeleted === "true" || isDeleted === true) {
      query.isDeleted = true;
    } else if (isDeleted === "false" || isDeleted === false) {
      query.isDeleted = false;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { excerpt: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email role avatar")
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
   * Get all comments for admin
   */
  async getAdminComments({ page = 1, limit = 15 } = {}) {
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [comments, total] = await Promise.all([
      Comment.find()
        .populate("author", "name email avatar")
        .populate("post", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Comment.countDocuments(),
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
   * Get all dynamic roles from role_master collection
   */
  async getRoles() {
    await this.initRoleMaster();
    const roles = await RoleMaster.find().sort({ isSystem: -1, createdAt: 1 }).lean();

    const rolesWithCounts = await Promise.all(
      roles.map(async (r) => {
        const userCount = await User.countDocuments({
          $or: [{ role_id: r._id }, { role: r.code }],
        });
        return {
          ...r,
          userCount,
        };
      })
    );

    return rolesWithCounts;
  }

  /**
   * Create a new dynamic role in role_master
   */
  async createRole({ name, code, description = "", permissions }) {
    await this.initRoleMaster();
    if (!name || !name.trim()) {
      const err = new Error("Role name is required");
      err.statusCode = 400;
      throw err;
    }

    const cleanCode = (code || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "_");

    const existing = await RoleMaster.findOne({ code: cleanCode });
    if (existing) {
      const err = new Error(`Role with code '${cleanCode}' already exists`);
      err.statusCode = 409;
      throw err;
    }

    const defaultPermissions = DEFAULT_FEATURES.map((df) => {
      const matched = (permissions || []).find((p) => p.feature === df.feature);
      return {
        feature: df.feature,
        featureLabel: df.featureLabel,
        create: matched ? !!matched.create : false,
        view: matched ? !!matched.view : true,
        update: matched ? !!matched.update : false,
        delete: matched ? !!matched.delete : false,
      };
    });

    const newRole = new RoleMaster({
      name: name.trim(),
      code: cleanCode,
      description: description.trim(),
      isSystem: false,
      isActive: true,
      permissions: defaultPermissions,
    });

    await newRole.save();
    return newRole.toObject();
  }

  /**
   * Update dynamic role details or its permissions in role_master
   */
  async updateRole(id, { name, description, isActive, permissions }) {
    await this.initRoleMaster();
    const role = await RoleMaster.findById(id);
    if (!role) {
      const err = new Error("Role not found");
      err.statusCode = 404;
      throw err;
    }

    if (name && !role.isSystem) role.name = name.trim();
    if (description !== undefined) role.description = description.trim();
    if (typeof isActive === "boolean" && !role.isSystem) role.isActive = isActive;

    if (Array.isArray(permissions)) {
      role.permissions = permissions.map((p) => ({
        feature: p.feature.toLowerCase().trim(),
        featureLabel: p.featureLabel || p.feature,
        create: !!p.create,
        view: !!p.view,
        update: !!p.update,
        delete: !!p.delete,
      }));
    }

    await role.save();
    return role.toObject();
  }

  /**
   * Delete dynamic role from role_master
   */
  async deleteRole(id) {
    await this.initRoleMaster();
    const role = await RoleMaster.findById(id);
    if (!role) {
      const err = new Error("Role not found");
      err.statusCode = 404;
      throw err;
    }

    if (role.isSystem) {
      const err = new Error("System default roles cannot be deleted");
      err.statusCode = 400;
      throw err;
    }

    const assignedUsers = await User.countDocuments({ role_id: role._id });
    if (assignedUsers > 0) {
      const err = new Error(
        `Cannot delete role: ${assignedUsers} users are currently assigned to it`
      );
      err.statusCode = 400;
      throw err;
    }

    await RoleMaster.findByIdAndDelete(id);
    return { success: true, message: `Role '${role.name}' deleted successfully` };
  }

  /**
   * Get role-wise permissions matrix directly from role_master
   */
  async getPermissions() {
    await this.initRoleMaster();
    const roles = await this.getRoles();

    const matrix = [];
    roles.forEach((r) => {
      (r.permissions || []).forEach((p) => {
        matrix.push({
          role: r.code,
          roleName: r.name,
          role_id: r._id,
          feature: p.feature,
          featureLabel: p.featureLabel,
          permissions: {
            create: !!p.create,
            view: !!p.view,
            update: !!p.update,
            delete: !!p.delete,
          },
        });
      });
    });

    return matrix;
  }

  /**
   * Update role-wise permissions dynamically in role_master
   */
  async updatePermissions(items) {
    await this.initRoleMaster();
    if (!Array.isArray(items)) {
      items = [items];
    }

    const validItems = items.filter(
      (item) => item && (item.role || item.role_id) && item.feature
    );
    if (validItems.length === 0) {
      return this.getPermissions();
    }

    // Group items by role
    const byRole = {};
    for (const item of validItems) {
      const roleKey = (item.role || "").toLowerCase();
      if (!byRole[roleKey]) byRole[roleKey] = [];
      byRole[roleKey].push(item);
    }

    for (const [roleCode, permItems] of Object.entries(byRole)) {
      const roleDoc = await RoleMaster.findOne({ code: roleCode });
      if (!roleDoc) continue;

      const currentPerms = roleDoc.permissions || [];
      for (const item of permItems) {
        const featIdx = currentPerms.findIndex(
          (p) => p.feature.toLowerCase() === item.feature.toLowerCase()
        );
        const newPerm = {
          feature: item.feature.toLowerCase(),
          featureLabel: item.featureLabel || item.feature,
          create: !!item.permissions?.create,
          view: !!item.permissions?.view,
          update: !!item.permissions?.update,
          delete: !!item.permissions?.delete,
        };

        if (featIdx >= 0) {
          currentPerms[featIdx] = newPerm;
        } else {
          currentPerms.push(newPerm);
        }
      }

      roleDoc.permissions = currentPerms;
      await roleDoc.save();
    }

    return this.getPermissions();
  }
}

export default new AdminService();
