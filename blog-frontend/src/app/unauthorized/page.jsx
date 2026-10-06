import React from "react";
import Link from "next/link";
import { FiAlertTriangle, FiHome } from "react-icons/fi";

export default function UnauthorizedPage() {
  return (
    <div className="container py-5 text-center min-vh-75 d-flex flex-column justify-content-center align-items-center">
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          marginBottom: "20px",
        }}
      >
        <FiAlertTriangle />
      </div>

      <h1 className="fw-bolder mb-2">403 - Access Denied</h1>
      <p className="text-muted mb-4" style={{ maxWidth: "480px", fontSize: "15px" }}>
        Role-Based Access Control (RBAC) Notice: You do not possess administrator credentials to access this area.
      </p>

      <div className="d-flex gap-3">
        <Link href="/" className="blog-btn-primary">
          <FiHome size={16} /> Return to Home
        </Link>
        <Link href="/login" className="blog-btn-outline">
          Sign In as Admin
        </Link>
      </div>
    </div>
  );
}
