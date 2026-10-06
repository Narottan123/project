import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RoleMaster from "../models/RoleMaster.js";
import BaseService from "./baseService.js";

const getSecretKey = () => {
  return (
    process.env.ACCESS_TOKEN_PRIVATE_KEY ||
    process.env.JWT_SECRET ||
    "my_blog_super_secret_access_token_key_12345"
  );
};

const getRefreshKey = () => {
  return (
    process.env.REFRESH_TOKEN_PRIVATE_KEY ||
    "my_blog_super_secret_refresh_token_key_67890"
  );
};

class AuthService extends BaseService {
  /**
   * Generate access and refresh tokens
   */
  generateTokens(user) {
    const payload = {
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      role_id: user.role_id?._id
        ? user.role_id._id.toString()
        : user.role_id?.toString() || null,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, getSecretKey(), {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
    });

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      getRefreshKey(),
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
      }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  async registerUser({ name, email, password, role = "user", avatar = "", bio = "" }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      const error = new Error("An account with this email address already exists.");
      error.statusCode = 400;
      throw error;
    }

    // If this is the very first user created in the system, grant them admin role
    const totalUsers = await User.countDocuments();
    const finalRole = totalUsers === 0 ? "admin" : role || "user";
    const roleDoc = await RoleMaster.findOne({ code: finalRole });

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: finalRole,
      role_id: roleDoc ? roleDoc._id : null,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio,
    });

    await user.save();
    await user.populate("role_id");
    const tokens = this.generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Standard Email & Password Login
   */
  async loginUser({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("Account has been suspended. Please contact administrator.");
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    if (!user.role_id) {
      const roleDoc = await RoleMaster.findOne({ code: user.role || "user" });
      if (roleDoc) {
        user.role_id = roleDoc._id;
        await user.save();
      }
    }
    await user.populate("role_id");

    const tokens = this.generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(tokenString) {
    let decoded;
    try {
      decoded = jwt.verify(tokenString, getRefreshKey());
    } catch {
      const error = new Error("Invalid or expired refresh token.");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== tokenString) {
      const error = new Error("Invalid refresh token. Please sign in again.");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("Account is suspended.");
      error.statusCode = 403;
      throw error;
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * OAuth Social Login (Google & Facebook)
   */
  async socialLogin({ provider = "google", email, name, id, avatar = "", credential, token }) {
    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedId = id;
    let resolvedAvatar = avatar;

    // Support Google Identity Services ID token (credential / token)
    if ((credential || token) && (!resolvedEmail || !resolvedName)) {
      try {
        const decoded = jwt.decode(credential || token);
        if (decoded && typeof decoded === "object") {
          if (decoded.email) resolvedEmail = decoded.email;
          if (decoded.name) resolvedName = decoded.name;
          if (decoded.sub) resolvedId = decoded.sub;
          if (decoded.picture) resolvedAvatar = decoded.picture;
        }
      } catch {
        // Fallback to provided fields
      }
    }

    if (!resolvedEmail) {
      const error = new Error("Social login requires a valid email address.");
      error.statusCode = 400;
      throw error;
    }

    if (!resolvedName) {
      resolvedName = resolvedEmail.split("@")[0] || `${provider} User`;
    }

    if (!resolvedId) {
      resolvedId = `${provider}_${Date.now()}`;
    }

    const normalizedEmail = resolvedEmail.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // First user is admin if none exists
      const totalUsers = await User.countDocuments();
      const role = totalUsers === 0 ? "admin" : "user";
      const roleDoc = await RoleMaster.findOne({ code: role });

      user = new User({
        name: resolvedName,
        email: normalizedEmail,
        role,
        role_id: roleDoc ? roleDoc._id : null,
        provider,
        avatar:
          resolvedAvatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(resolvedName)}`,
        googleId: provider === "google" ? resolvedId : null,
        facebookId: provider === "facebook" ? resolvedId : null,
        isActive: true,
      });
    } else {
      if (!user.isActive) {
        const error = new Error("Account has been suspended.");
        error.statusCode = 403;
        throw error;
      }
      if (!user.role_id) {
        const roleDoc = await RoleMaster.findOne({ code: user.role || "user" });
        if (roleDoc) user.role_id = roleDoc._id;
      }
      if (provider === "google" && !user.googleId) user.googleId = resolvedId;
      if (provider === "facebook" && !user.facebookId) user.facebookId = resolvedId;
      if (resolvedAvatar && !user.avatar) user.avatar = resolvedAvatar;
    }

    await user.save();
    await user.populate("role_id");
    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Logout user by clearing refresh token
   */
  async logoutUser(userId) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    return true;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId) {
    const user = await User.findById(userId).populate("role_id");
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }
}

export default new AuthService();
