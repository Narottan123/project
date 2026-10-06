import authRouter from "./auth.js";
import postRouter from "./postRoutes.js";
import commentRouter from "./commentRoutes.js";
import adminRouter from "./adminRoutes.js";

export default {
  run: (app) => {
    // API Version 1 Routes
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/posts", postRouter);
    app.use("/api/v1/comments", commentRouter);
    app.use("/api/v1/admin", adminRouter);

    // Health check endpoint
    app.get("/api/v1/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Blog API is healthy and operational",
        timestamp: new Date().toISOString(),
      });
    });
  },
};
