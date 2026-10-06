"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiEdit,
  FiUser,
  FiLogOut,
  FiShield,
  FiBookOpen,
  FiLayers,
} from "react-icons/fi";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="blog-nav py-3">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Logo */}
        <Link href="/" className="blog-nav-brand">
          <span className="brand-badge">B</span>
          <span style={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
            Dev<span style={{ color: "var(--primary_Color)" }}>Blog</span>
          </span>
        </Link>

        {/* Center Links */}
        <div className="d-none d-md-flex align-items-center gap-2">
          <Link
            href="/"
            className={`blog-nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Feed
          </Link>

          {isAuthenticated && (
            <Link
              href="/my-posts"
              className={`blog-nav-link ${
                pathname === "/my-posts" ? "active" : ""
              }`}
            >
              My Articles
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`blog-nav-link ${
                pathname.startsWith("/admin") ? "active" : ""
              }`}
            >
              <FiShield size={14} className="me-1" />
              Admin
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/posts/create" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
                <FiEdit size={14} />
                <span>Write Post</span>
              </Link>

              {/* User Avatar & Dropdown */}
              <div className="position-relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 text-dark"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        user?.name || "User"
                      )}`
                    }
                    alt={user?.name}
                    className="rounded-circle border"
                    style={{
                      width: "36px",
                      height: "36px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    className="d-none d-lg-block text-start"
                    style={{ lineHeight: 1.2 }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                      {user?.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6c757d",
                        textTransform: "capitalize",
                      }}
                    >
                      {user?.role}
                    </div>
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 py-2 shadow-lg"
                    style={{
                      width: "210px",
                      background: "#fff",
                      borderRadius: "12px",
                      border: "1px solid var(--blog-border)",
                      zIndex: 1050,
                    }}
                  >
                    <div className="px-3 py-2 border-bottom">
                      <div className="fw-semibold text-truncate">
                        {user?.name}
                      </div>
                      <div
                        className="text-muted text-truncate"
                        style={{ fontSize: "12px" }}
                      >
                        {user?.email}
                      </div>
                    </div>

                    <Link
                      href="/my-posts"
                      className="dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                      onClick={() => setDropdownOpen(false)}
                      style={{ fontSize: "14px", textDecoration: "none", color: "#334155" }}
                    >
                      <FiBookOpen size={15} />
                      My Articles
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                        style={{ fontSize: "14px", textDecoration: "none", color: "#6366f1", fontWeight: 600 }}
                      >
                        <FiShield size={15} />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-top my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="dropdown-item px-3 py-2 d-flex align-items-center gap-2 text-danger"
                      style={{
                        border: "none",
                        background: "none",
                        width: "100%",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <FiLogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link
                href="/login"
                className="btn btn-outline-primary btn-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
