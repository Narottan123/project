"use client";

import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { FiRotateCcw, FiTrash2 } from "react-icons/fi";

/**
 * OverviewTab Component
 * Shows recent posts summary table and dashboard stats
 */
export default function OverviewTab({
  posts = [],
  postSearch,
  setPostSearch,
  handleRestorePost,
  handlePermanentDeletePost,
}) {
  return (
    <div className="crm-table-card">
      <div className="crm-table-card-header">
        <div>
          <h3 className="crm-table-title">Recent Articles</h3>
          <p className="crm-table-subtitle">
            Overview of recently created and published articles
          </p>
        </div>
        <div className="crm-table-filters">
          <input
            type="text"
            className="crm-search-pill"
            placeholder="Search articles..."
            value={postSearch}
            onChange={(e) => setPostSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="crm-table">
          <thead>
            <tr>
              <th>S/L</th>
              <th>Article Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.slice(0, 8).map((p, idx) => (
              <tr key={p._id}>
                <td className="fw-semibold">{idx + 1}</td>
                <td>
                  <Link
                    href={`/posts/${p.slug}`}
                    className="text-decoration-none text-dark fw-semibold"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="text-muted">{p.author?.name || "Author"}</td>
                <td>
                  <span className="badge bg-light text-dark border">
                    {p.category || "General"}
                  </span>
                </td>
                <td>
                  {p.isDeleted ? (
                    <span className="badge bg-danger">Absent / Deleted</span>
                  ) : (
                    <span className="badge bg-success">Published</span>
                  )}
                </td>
                <td className="text-muted">
                  {dayjs(p.createdAt).format("DD/MM ddd")}
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    {p.isDeleted ? (
                      <button
                        type="button"
                        onClick={() => handleRestorePost(p._id)}
                        className="btn btn-sm btn-outline-success p-1"
                        title="Restore post"
                      >
                        <FiRotateCcw size={13} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handlePermanentDeletePost(p._id)}
                      className="btn btn-sm btn-outline-danger p-1"
                      title="Delete post"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <span className="text-muted fw-bold" style={{ fontSize: "14px" }}>
          Total Articles: {posts.length}
        </span>
      </div>
    </div>
  );
}
