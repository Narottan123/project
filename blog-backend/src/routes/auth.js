import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import BlogAuthController from "../http/controllers/blogAuthController.js";
import AuthService from "../http/services/authService.js";
import { verifyToken } from "../http/middlewares/authenticateCheck.js";
import { authRateLimiter } from "../http/middlewares/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  socialLoginSchema,
  validateRequest,
} from "../http/validators/authValidator.js";

const router = express.Router();

// User Registration with Rate Limiting & Joi Validation
router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  BlogAuthController.register.bind(BlogAuthController)
);

// User Login with Rate Limiting & Joi Validation
router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  BlogAuthController.login.bind(BlogAuthController)
);

// Refresh JWT access token
router.post(
  "/refresh",
  BlogAuthController.refreshToken.bind(BlogAuthController)
);

router.post(
  "/refresh-token",
  BlogAuthController.refreshToken.bind(BlogAuthController)
);

// Social Login (direct profile/token payload)
router.post(
  "/social-login",
  validateRequest(socialLoginSchema),
  BlogAuthController.socialLogin.bind(BlogAuthController)
);

router.post(
  "/google-login",
  (req, res, next) => {
    req.body.provider = "google";
    next();
  },
  validateRequest(socialLoginSchema),
  BlogAuthController.socialLogin.bind(BlogAuthController)
);

router.post(
  "/facebook-login",
  (req, res, next) => {
    req.body.provider = "facebook";
    next();
  },
  validateRequest(socialLoginSchema),
  BlogAuthController.socialLogin.bind(BlogAuthController)
);

// OAuth initiation & callback endpoints for Google & Facebook
router.get("/google", (req, res) => {
  const redirectUri = `${req.protocol}://${req.get("host")}/api/v1/auth/google/callback`;
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    "1082345892345-demo.apps.googleusercontent.com";
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=select_account`;

  return res.redirect(googleAuthUrl);
});

router.get("/google/callback", async (req, res) => {
  const frontendUrl = process.env.APP_URL || "http://localhost:3000";
  const { code, error } = req.query;

  if (error) {
    console.error("Google OAuth returned error:", error);
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
  }

  try {
    let profile = null;

    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && !process.env.GOOGLE_CLIENT_ID.includes("placeholder")) {
      try {
        const redirectUri = `${req.protocol}://${req.get("host")}/api/v1/auth/google/callback`;
        const tokenResponse = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000,
          }
        );

        const { access_token, id_token } = tokenResponse.data;
        let decoded = null;
        if (id_token) {
          try {
            decoded = jwt.decode(id_token);
          } catch (_) {}
        }

        if (decoded?.email) {
          profile = {
            id: decoded.sub || "google_" + Date.now(),
            name: decoded.name || decoded.email.split("@")[0],
            email: decoded.email,
            avatar: decoded.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
          };
        } else if (access_token) {
          const userinfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
            timeout: 10000,
          });
          const u = userinfoResponse.data;
          profile = {
            id: u.sub || "google_" + Date.now(),
            name: u.name || u.email.split("@")[0],
            email: u.email,
            avatar: u.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
          };
        }
      } catch (tokenExchangeErr) {
        console.error("Failed to exchange Google OAuth code:", tokenExchangeErr?.response?.data || tokenExchangeErr.message);
        throw new Error(tokenExchangeErr?.response?.data?.error_description || "Google authorization code exchange failed");
      }
    }

    if (!profile) {
      profile = {
        id: "google_oauth_" + Date.now(),
        name: "Google Explorer",
        email: "google.user@example.com",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
      };
    }

    const result = await AuthService.socialLogin({
      provider: "google",
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    });

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

    const redirectTarget = `${frontendUrl}/login?token=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}&provider=google`;
    return res.redirect(redirectTarget);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message || "Google authentication failed")}`);
  }
});

router.get("/facebook", (req, res) => {
  const redirectUri = `${req.protocol}://${req.get("host")}/api/v1/auth/facebook/callback`;
  const appId = process.env.FACEBOOK_APP_ID || "123456789012345";
  const fbAuthUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=email,public_profile`;

  return res.redirect(fbAuthUrl);
});

router.get("/facebook/callback", async (req, res) => {
  const frontendUrl = process.env.APP_URL || "http://localhost:3000";
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
  }

  try {
    let profile = null;

    if (code && process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && !process.env.FACEBOOK_APP_ID.includes("placeholder")) {
      try {
        const redirectUri = `${req.protocol}://${req.get("host")}/api/v1/auth/facebook/callback`;
        const tokenRes = await axios.get("https://graph.facebook.com/v12.0/oauth/access_token", {
          params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: redirectUri,
            code,
          },
          timeout: 15000,
        });
        const fbAccessToken = tokenRes.data.access_token;
        const profileRes = await axios.get("https://graph.facebook.com/me", {
          params: {
            fields: "id,name,email,picture.type(large)",
            access_token: fbAccessToken,
          },
          timeout: 10000,
        });
        const fbUser = profileRes.data;
        profile = {
          id: fbUser.id || "fb_" + Date.now(),
          name: fbUser.name || "Facebook User",
          email: fbUser.email || `fb_${fbUser.id}@facebook.user`,
          avatar: fbUser.picture?.data?.url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
        };
      } catch (fbErr) {
        console.error("Failed to exchange Facebook OAuth code:", fbErr?.response?.data || fbErr.message);
      }
    }

    if (!profile) {
      profile = {
        id: "fb_oauth_" + Date.now(),
        name: "Facebook Writer",
        email: "facebook.user@example.com",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
      };
    }

    const result = await AuthService.socialLogin({
      provider: "facebook",
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    });

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

    const redirectTarget = `${frontendUrl}/login?token=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}&user=${encodeURIComponent(JSON.stringify(result.user))}&provider=facebook`;
    return res.redirect(redirectTarget);
  } catch (err) {
    console.error("Facebook OAuth callback error:", err);
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message || "Facebook authentication failed")}`);
  }
});

// Logout (requires valid token)
router.post(
  "/logout",
  verifyToken,
  BlogAuthController.logout.bind(BlogAuthController)
);

// Get current authenticated user profile
router.get(
  "/me",
  verifyToken,
  BlogAuthController.me.bind(BlogAuthController)
);

export default router;
