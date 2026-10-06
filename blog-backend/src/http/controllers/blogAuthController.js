import BaseController from "./baseController.js";
import AuthService from "../services/authService.js";
import ActivityLogService from "../services/activityLogService.js";

class BlogAuthController extends BaseController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Log registration activity
      ActivityLogService.logActivity({
        user: result.user,
        action: "REGISTER",
        details: { email: result.user.email, role: result.user.role },
        req,
      });

      return this.success(res, result, null, "User registered successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login with email and password
   */
  async login(req, res, next) {
    try {
      const result = await AuthService.loginUser(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Also set auth_token cookie for ease of testing
      res.cookie("auth_token", result.tokens.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Log login activity
      ActivityLogService.logActivity({
        user: result.user,
        action: "LOGIN",
        details: { email: result.user.email },
        req,
      });

      return this.success(res, result, null, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT access token
   */
  async refreshToken(req, res, next) {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        return this.errorMessage(res, "Refresh token is required", 400);
      }

      const result = await AuthService.refreshToken(token);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return this.success(res, result, null, "Tokens refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Social OAuth Login (Google / Facebook)
   */
  async socialLogin(req, res, next) {
    try {
      const result = await AuthService.socialLogin(req.body);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("auth_token", result.tokens.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      ActivityLogService.logActivity({
        user: result.user,
        action: "SOCIAL_LOGIN",
        details: { provider: req.body.provider, email: req.body.email },
        req,
      });

      return this.success(res, result, null, `${req.body.provider} login successful`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      if (userId) {
        await AuthService.logoutUser(userId);
        ActivityLogService.logActivity({
          user: req.user,
          action: "LOGOUT",
          req,
        });
      }

      res.clearCookie("refreshToken");
      res.clearCookie("auth_token");

      return this.success(res, null, null, "Successfully logged out");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user details
   */
  async me(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const user = await AuthService.getCurrentUser(userId);
      return this.success(res, user, null, "Current user details retrieved");
    } catch (error) {
      next(error);
    }
  }
}

export default new BlogAuthController();
