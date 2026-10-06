import ActivityLogService from "../services/activityLogService.js";

/**
 * Middleware factory to log a user activity after response is sent
 * @param {string} action Activity action name e.g. 'CREATE_POST', 'UPDATE_POST'
 */
export const logActivity = (action) => {
  return (req, res, next) => {
    // Capture the original send to log after response
    const originalJson = res.json;

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        ActivityLogService.logActivity({
          user: req.user,
          action,
          details: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            body: req.method !== "GET" ? { ...req.body, password: undefined } : undefined,
          },
          req,
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

export default {
  logActivity,
};
