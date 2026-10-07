"use client";

import React from "react";
import dayjs from "dayjs";
import { FiTrash2 } from "react-icons/fi";
import Pagination from "@/components/common/Pagination";

/**
 * CommentsTable Component
 * Handles comment moderation and administrative deletion
 */
export default function CommentsTable({
  comments = [],
  handleDeleteComment,
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
          <h3 className="crm-table-title">Manage Comments</h3>
          <p className="crm-table-subtitle">
            Live comments moderation across all discussions
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="crm-table">
          <thead>
            <tr>
              <th>S/L</th>
              <th>Comment Content</th>
              <th>Author</th>
              <th>Target Post</th>
              <th>Created Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c, idx) => (
              <tr key={c._id}>
                <td className="fw-semibold">{idx + 1}</td>
                <td
                  className="text-truncate"
                  style={{ maxWidth: "320px" }}
                  title={c.content}
                >
                  {c.content}
                </td>
                <td>{c.author?.name || "User"}</td>
                <td>
                  <span
                    className="text-muted text-truncate d-inline-block"
                    style={{ maxWidth: "200px" }}
                    title={c.post?.title || "Post"}
                  >
                    {c.post?.title || "Post"}
                  </span>
                </td>
                <td className="text-muted">
                  {dayjs(c.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c._id)}
                    className="btn btn-sm btn-outline-danger p-1"
                    title="Delete comment"
                  >
                    <FiTrash2 size={13} />
                  </button>
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
          total={total ?? comments.length}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
