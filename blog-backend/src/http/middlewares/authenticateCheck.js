import jwt from "jsonwebtoken";
import cookie from "cookie";

const getSecretKey = () => {
  return (
    process.env.ACCESS_TOKEN_PRIVATE_KEY ||
    process.env.JWT_SECRET ||
    "my_blog_super_secret_access_token_key_12345"
  );
};

export const verifyToken = (req, res, next) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  let token = null;

  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Custom header
  if (!token && req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  // 3. Cookie fallback
  if (!token && (cookies.auth_token || cookies.token)) {
    token = cookies.auth_token || cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      auth: false,
      message: "No token provided. Please log in to access this resource.",
    });
  }

  jwt.verify(token, getSecretKey(), (err, decoded) => {
    if (err) {
      const isExpired = err.name === "TokenExpiredError";
      return res.status(401).json({
        success: false,
        auth: false,
        token_expired: isExpired,
        message: isExpired ? "Access token expired. Please refresh token." : "Failed to authenticate token.",
      });
    }

    req.user = decoded;
    next();
  });
};

export default {
  verificationAuth: verifyToken,
};
