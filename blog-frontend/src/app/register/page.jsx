"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import SocialAuthModal from "@/components/common/SocialAuthModal";

export default function RegisterPage() {
  const { register, socialLogin, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    bio: "",
  });

  // Social Auth Modal State
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState("google");
  const [socialLoading, setSocialLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    await register(formData);
  };

  const handleGoogleSignup = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL_LOCAL || "http://localhost:8007/";
    const base = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;
    window.location.href = `${base}api/v1/auth/google`;
  };

  const handleFacebookSignup = () => {
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
    <div className="auth-container">
      <div className="auth-card-wrapper" style={{ maxWidth: "480px" }}>
        {/* Header */}
        <div className="auth-header">
          <span className="auth-logo">B</span>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-subtitle">
            Join the community of software developers and writers.
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Social Logins */}
          <div className="d-grid gap-2 mb-2">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="auth-social-btn"
            >
              <FcGoogle size={20} />
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={handleFacebookSignup}
              className="auth-social-btn"
            >
              <FaFacebook size={19} color="#1877F2" />
              Sign up with Facebook
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
            <span className="auth-divider-text">or register with email</span>
            <div className="auth-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: "13px" }}>
                Full Name *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <FiUser />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: "13px" }}>
                Email Address *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <FiMail />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: "13px" }}>
                Password (min. 6 characters) *
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
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "13px" }}>
                <FiShield /> Account Role (RBAC)
              </label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                style={{ fontSize: "14px" }}
              >
                <option value="user">Regular User (Can author & manage own articles)</option>
                <option value="admin">Administrator (Can manage all users, posts & comments)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold" style={{ fontSize: "13px" }}>
                Brief Bio (optional)
              </label>
              <input
                type="text"
                name="bio"
                className="form-control"
                placeholder="Software engineer, open source contributor..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="blog-btn-primary w-100 justify-content-center py-2"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <FiArrowRight />
            </button>
          </form>
        </div>

        <div className="text-center mt-4 text-muted" style={{ fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/login" className="text-primary fw-bold text-decoration-none">
            Sign in
          </Link>
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
    </div>
  );
}
