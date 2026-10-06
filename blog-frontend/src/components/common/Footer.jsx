import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="app-footer mt-5">
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-badge">B</span>
              <span className="fw-bold" style={{ fontSize: "1.2rem", letterSpacing: "-0.5px" }}>
                Dev<span style={{ color: "var(--color-primary)" }}>Blog</span>
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: "14px", lineHeight: "1.6" }}>
              A full-stack modern blog platform crafted using the MERN stack (MongoDB, Express.js, React.js with Next.js App Router, Node.js) featuring JWT authentication, RBAC, soft-deletes, and real-time Socket.io notifications.
            </p>
          </div>

          <div className="col-lg-2 col-6">
            <h6 className="fw-bold mb-3" style={{ fontSize: "15px" }}>Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "14px" }}>
              <li><Link href="/" className="text-decoration-none text-muted">All Articles</Link></li>
              <li><Link href="/posts/create" className="text-decoration-none text-muted">Write a Post</Link></li>
              <li><Link href="/my-posts" className="text-decoration-none text-muted">My Profile</Link></li>
              <li><Link href="/admin" className="text-decoration-none text-muted">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-6">
            <h6 className="fw-bold mb-3" style={{ fontSize: "15px" }}>Stack & Tech</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-muted" style={{ fontSize: "14px" }}>
              <li>MongoDB & Mongoose ODM</li>
              <li>Express.js RESTful API</li>
              <li>Next.js App Router (React 19)</li>
              <li>JWT Tokens & RBAC Security</li>
              <li>Socket.io Real-Time Alerts</li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h6 className="fw-bold mb-3" style={{ fontSize: "15px" }}>Admin Access</h6>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Test credentials: <br />
              <strong>Admin:</strong> admin@blog.com / password123 <br />
              <strong>User:</strong> jane@blog.com / password123
            </p>
          </div>
        </div>

        <div
          className="d-flex flex-column flex-md-row align-items-center justify-content-between pt-4 mt-4 border-top"
          style={{ fontSize: "13px", color: "var(--blog-muted)" }}
        >
          <div>&copy; {new Date().getFullYear()} DevBlog Platform. All rights reserved.</div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Built with MERN Stack</span>
            <span>•</span>
            <span>Clean Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
