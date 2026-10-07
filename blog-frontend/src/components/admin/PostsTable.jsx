"use client";

import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { FiRotateCcw, FiTrash2 } from "react-icons/fi";
import Pagination from "@/components/common/Pagination";

/**
 * PostsTable Component
 * Manages all blog articles (publish, soft-deleted, restore, permanent delete)
 */
export default function PostsTable({
  posts = [],
  postSearch,
  setPostSearch,
  handleRestorePost,
  handlePermanentDeletePost,
  page = 1,
  totalPages = 1,
  total,
  limit = 10,
  onPageChange,
}) {
  return (
    <div className="crm-table-card">
      <div className="crm-table-card-header">
        <div>
          <h3 className="crm-table-title">Manage Articles</h3>
          <p className="crm-table-subtitle">
            Review, moderate, and manage all articles
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
              <th>Soft Deleted?</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p, idx) => (
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
                  <span className="badge bg-secondary">{p.status}</span>
                </td>
                <td>
                  {p.isDeleted ? (
                    <span className="badge bg-danger">
                      Deleted ({dayjs(p.deletedAt).format("MMM D")})
                    </span>
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
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
                      title="Permanent delete"
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

      {onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total ?? posts.length}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
