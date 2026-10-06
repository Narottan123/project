import ActivityLog from "../models/ActivityLog.js";
import BaseService from "./baseService.js";

class ActivityLogService extends BaseService {
  async logActivity({ user = null, action, details = {}, req = null }) {
    try {
      let ipAddress = "";
      let userAgent = "";
      if (req) {
        ipAddress =
          req.headers["x-forwarded-for"] ||
          req.connection?.remoteAddress ||
          req.socket?.remoteAddress ||
          "";
        userAgent = req.headers["user-agent"] || "";
      }
      return await ActivityLog.create({
        user: user ? (user._id || user.id || user) : null,
        action,
        details,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error("ActivityLogService error:", error.message);
      return null;
    }
  }

  async getLogs({ page = 1, limit = 20, action = null, userId = null } = {}) {
    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("user", "name email role avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page: parseInt(page),
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }
}

export default new ActivityLogService();
