"use client";

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiX, FiCheck, FiUser, FiMail, FiExternalLink, FiShield } from "react-icons/fi";

export default function SocialAuthModal({
  isOpen,
  onClose,
  provider = "google", // 'google' | 'facebook'
  onSelectAccount,
  loading = false,
}) {
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [activeTab, setActiveTab] = useState("accounts"); // 'accounts' | 'custom'
  const isGoogle = provider === "google";

  if (!isOpen) return null;

  // Preset demo accounts with authentic avatars
  const demoAccounts = isGoogle
    ? [
        {
          id: "google_sub_10928374",
          name: "Alex Developer",
          email: "alex.developer@gmail.com",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
        },
        {
          id: "google_sub_28471920",
          name: "Sarah Chen",
          email: "sarah.chen@googlemail.com",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
        },
      ]
    : [
        {
          id: "fb_uid_987654321",
          name: "David Miller",
          email: "david.miller@facebook.com",
          avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80",
        },
        {
          id: "fb_uid_123456789",
          name: "Elena Rostova",
          email: "elena.rostova@facebook.com",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80",
        },
      ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    onSelectAccount({
      provider,
      id: `${provider}_custom_${Date.now()}`,
      name: customName || customEmail.split("@")[0],
      email: customEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customName || customEmail)}`,
    });
  };

  const handleBackendOAuthRedirect = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BASE_URL_LOCAL || "http://localhost:8007/";
    const target = `${backendUrl}api/v1/auth/${provider}`;
    window.location.href = target;
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1050,
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px" }}>
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          {/* Header */}
          <div
            className="p-4 text-white d-flex align-items-center justify-content-between"
            style={{
              background: isGoogle
                ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                : "linear-gradient(135deg, #1877F2 0%, #0D65D9 100%)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "36px", height: "36px" }}
              >
                {isGoogle ? <FcGoogle size={22} /> : <FaFacebook size={22} color="#1877F2" />}
              </div>
              <div>
                <h6 className="mb-0 fw-bold">
                  {isGoogle ? "Sign in with Google" : "Log in with Facebook"}
                </h6>
                <small className="opacity-75" style={{ fontSize: "11px" }}>
                  OAuth 2.0 Identity Consent
                </small>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-link text-white p-0 opacity-75"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-white">
            <div className="text-center mb-3">
              <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                Choose an account to continue to <strong>DevBlog</strong>
              </p>
              <div className="d-flex align-items-center justify-content-center gap-1 text-muted" style={{ fontSize: "11px" }}>
                <FiShield size={12} className="text-success" />
                <span>Encrypted OAuth 2.0 JWT Token Exchange</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="d-flex border-bottom mb-3" style={{ fontSize: "13px" }}>
              <button
                type="button"
                className={`btn btn-link text-decoration-none pb-2 flex-grow-1 text-center ${
                  activeTab === "accounts"
                    ? "fw-bold text-primary border-bottom border-primary border-2"
                    : "text-muted"
                }`}
                onClick={() => setActiveTab("accounts")}
              >
                Select Account
              </button>
              <button
                type="button"
                className={`btn btn-link text-decoration-none pb-2 flex-grow-1 text-center ${
                  activeTab === "custom"
                    ? "fw-bold text-primary border-bottom border-primary border-2"
                    : "text-muted"
                }`}
                onClick={() => setActiveTab("custom")}
              >
                Use Your Account
              </button>
            </div>

            {/* Tab 1: Account List */}
            {activeTab === "accounts" && (
              <div className="d-flex flex-column gap-2 mb-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    disabled={loading}
                    onClick={() => onSelectAccount({ provider, ...account })}
                    className="btn btn-outline-light text-start p-2 d-flex align-items-center gap-3 border"
                    style={{
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                      backgroundColor: "#f8fafc",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#eff6ff";
                      e.currentTarget.style.borderColor = "#93c5fd";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="rounded-circle border"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                        {account.name}
                      </div>
                      <div className="text-muted text-truncate" style={{ fontSize: "12px" }}>
                        {account.email}
                      </div>
                    </div>
                    <FiCheck size={16} className="text-muted opacity-50" />
                  </button>
                ))}
              </div>
            )}

            {/* Tab 2: Custom Account Entry */}
            {activeTab === "custom" && (
              <form onSubmit={handleCustomSubmit} className="mb-3">
                <div className="mb-2">
                  <label className="form-label text-muted" style={{ fontSize: "12px" }}>
                    Your Full Name
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <FiUser size={14} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Jane Developer"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted" style={{ fontSize: "12px" }}>
                    Your {isGoogle ? "Google" : "Facebook"} Email Address
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <FiMail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder={isGoogle ? "name@gmail.com" : "name@facebook.com"}
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !customEmail}
                  className={`btn btn-sm w-100 py-2 fw-bold text-white ${
                    isGoogle ? "btn-dark" : "btn-primary"
                  }`}
                  style={{ borderRadius: "8px" }}
                >
                  {loading ? "Authenticating..." : `Sign in as ${customName || "User"}`}
                </button>
              </form>
            )}

            {/* Alternative: Test Backend OAuth 2.0 Redirect */}
            <div className="pt-2 border-top text-center">
              <button
                type="button"
                onClick={handleBackendOAuthRedirect}
                className="btn btn-link text-decoration-none p-0 text-muted d-inline-flex align-items-center gap-1"
                style={{ fontSize: "11px" }}
              >
                <span>Test Server OAuth 2.0 Redirect Flow</span>
                <FiExternalLink size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
