"use client";

import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import Pagination from "@/components/common/Pagination";

/**
 * MyPostsTable Component
 * @param {Array} posts - List of user's posts
 * @param {Function} onDelete - Handler for deleting a post
 * @param {number} page - Current active page
 * @param {number} totalPages - Total pages count
 * @param {number} total - Total records count
 * @param {Function} onPageChange - Page change callback
 */
export default function MyPostsTable({
  posts = [],
  onDelete,
  page = 1,
  totalPages = 1,
  total,
  limit = 10,
  onPageChange,
}) {
  return (
    <div className="blog-card overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light" style={{ fontSize: "13px" }}>
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3">Category</th>
              <th className="py-3">Status</th>
              <th className="py-3">Views</th>
              <th className="py-3">Date</th>
              <th className="py-3 px-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {posts.map((post) => (
              <tr key={post._id}>
                <td className="py-3 px-4 fw-semibold">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-decoration-none text-dark hover-primary"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="py-3">
                  <span className="badge bg-light text-dark border">
                    {post.category || "General"}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`badge ${
                      post.status === "published"
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-warning-subtle text-warning border border-warning-subtle"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="py-3 text-muted">{post.views || 0}</td>
                <td className="py-3 text-muted" style={{ fontSize: "13px" }}>
                  {dayjs(post.createdAt).format("MMM D, YYYY")}
                </td>
                <td className="py-3 px-4 text-end">
                  <div className="d-inline-flex gap-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="btn btn-sm btn-outline-secondary p-1"
                      title="View article"
                    >
                      <FiEye size={15} />
                    </Link>
                    <Link
                      href={`/posts/edit/${post._id}`}
                      className="btn btn-sm btn-outline-primary p-1"
                      title="Edit article"
                    >
                      <FiEdit size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(post._id)}
                      className="btn btn-sm btn-outline-danger p-1"
                      title="Delete article"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && (
        <div className="px-3 pb-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total ?? posts.length}
            limit={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
