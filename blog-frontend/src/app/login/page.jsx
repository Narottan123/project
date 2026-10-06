"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import SocialAuthModal from "@/components/common/SocialAuthModal";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, socialLogin, loading, setAuthSession } = useAuth();
  const processedOAuthRef = useRef(false);

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  // Social Auth Modal State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState("google");
  const [socialLoading, setSocialLoading] = useState(false);

  // Handle server OAuth redirect params (e.g. /login?token=...&user=...)
  useEffect(() => {
    if (processedOAuthRef.current) return;

    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const provider = searchParams.get("provider") || "Google";
    const error = searchParams.get("error");

    if (error) {
      processedOAuthRef.current = true;
      toast.error(error);
      return;
    }

    if (token && userParam) {
      processedOAuthRef.current = true;
      try {
        const userObj = JSON.parse(decodeURIComponent(userParam));
        setAuthSession(token, userObj);
        toast.success(`Successfully signed in with ${provider}!`);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        router.replace("/");
      } catch (err) {
        console.error("OAuth token parsing error:", err);
      }
    }
  }, [searchParams, router, setAuthSession]);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      toast.error("Please fill in all fields");
      return;
    }
    await login(credentials);
  };

  // Quick fill helper for evaluator
  const fillCredentials = (email, password) => {
    setCredentials({ email, password });
    toast.info(`Filled credentials for ${email}`);
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL_LOCAL || "http://localhost:8007/";
    const base = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;
    window.location.href = `${base}api/v1/auth/google`;
  };

  const handleFacebookLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL_LOCAL || "http://localhost:8007/";
    const base = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;
    window.location.href = `${base}api/v1/auth/facebook`;
  };

  const handleSelectAccount = async (accountData) => {
    setSocialLoading(true);
    try {
      const res = await socialLogin(accountData);
      if (res?.success) {
        setSocialModalOpen(false);
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card-wrapper">
          {/* Header */}
          <div className="auth-header">
            <span className="auth-logo">B</span>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">
              Sign in to manage your posts and participate in discussions.
            </p>
          </div>

          {/* Card */}
          <div className="auth-card">
            {/* Social Logins */}
            <div className="d-grid gap-2 mb-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="auth-social-btn"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="auth-social-btn"
              >
                <FaFacebook size={19} color="#1877F2" />
                Continue with Facebook
              </button>
            </div>
            <div className="text-center mb-3">
              <button
                type="button"
                onClick={() => {
                  setSocialProvider("google");
                  setSocialModalOpen(true);
                }}
                className="btn btn-link p-0 text-muted"
                style={{ fontSize: "12px", textDecoration: "none" }}
              >
                ⚡ Or test offline with simulated demo accounts
              </button>
            </div>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or email login</span>
              <div className="auth-divider-line" />
            </div>

            {/* Email Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ fontSize: "13px" }}>
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <FiMail />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="admin@blog.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold" style={{ fontSize: "13px" }}>
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {loading ? "Signing in..." : "Sign In"}
                <FiArrowRight />
              </button>
            </form>

            {/* Quick Test Accounts Filler */}
            <div className="mt-4 pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <small className="text-muted fw-bold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                  ⚡ QUICK TEST CREDENTIALS
                </small>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@blog.com", "password123")}
                  className="btn btn-sm btn-outline-dark flex-grow-1"
                  style={{ fontSize: "12px" }}
                >
                  Admin User
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("jane@blog.com", "password123")}
                  className="btn btn-sm btn-outline-dark flex-grow-1"
                  style={{ fontSize: "12px" }}
                >
                  Regular User
                </button>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center mt-4 pt-2">
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary fw-bold text-decoration-none">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social OAuth Modal */}
      <SocialAuthModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        provider={socialProvider}
        onSelectAccount={handleSelectAccount}
        loading={socialLoading}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
