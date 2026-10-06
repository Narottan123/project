import authService from "./authService.js";
import postService from "./postService.js";
import commentService from "./commentService.js";
import adminService from "./adminService.js";
import activityLogService from "./activityLogService.js";
import BaseService from "./baseService.js";

export const AuthService = authService;
export const PostService = postService;
export const CommentService = commentService;
export const AdminService = adminService;
export const ActivityLogService = activityLogService;

export default {
  BaseService,
  AuthService: authService,
  PostService: postService,
  CommentService: commentService,
  AdminService: adminService,
  ActivityLogService: activityLogService,
};
