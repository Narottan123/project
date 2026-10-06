import express from "express";
import AdminController from "../http/controllers/adminController.js";
import { verifyToken } from "../http/middlewares/authenticateCheck.js";
import { authorizeRoles } from "../http/middlewares/rbacCheck.js";

const router = express.Router();

// All admin routes require authentication and "admin" role
router.use(verifyToken, authorizeRoles("admin"));

// Dashboard statistics
router.get("/dashboard", AdminController.getDashboardStats.bind(AdminController));
router.get("/stats", AdminController.getDashboardStats.bind(AdminController));

// User Management
router.get("/users", AdminController.getUsers.bind(AdminController));
router.put("/users/:id", AdminController.updateUser.bind(AdminController));
router.delete("/users/:id", AdminController.deleteUser.bind(AdminController));

// Post Moderation
router.get("/posts", AdminController.getPosts.bind(AdminController));
router.put("/posts/:id/restore", AdminController.restorePost.bind(AdminController));
router.delete("/posts/:id/permanent", AdminController.hardDeletePost.bind(AdminController));

// Comment Moderation
router.get("/comments", AdminController.getComments.bind(AdminController));
router.delete("/comments/:id", AdminController.deleteComment.bind(AdminController));

// Audit / Activity Logs
router.get("/logs", AdminController.getActivityLogs.bind(AdminController));

// Dynamic Role-Master & Permissions
router.get("/roles", AdminController.getRoles.bind(AdminController));
router.post("/roles", AdminController.createRole.bind(AdminController));
router.put("/roles/:id", AdminController.updateRole.bind(AdminController));
router.delete("/roles/:id", AdminController.deleteRole.bind(AdminController));
router.get("/permissions", AdminController.getPermissions.bind(AdminController));
router.put("/permissions", AdminController.updatePermissions.bind(AdminController));

export default router;
