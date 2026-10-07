"use client";

import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  FiCalendar,
  FiClock,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";

/**
 * PostHeader Component for Post Detail Page
 */
export default function PostHeader({
  post,
  canModify,
  onDelete,
  onShare,
  readTime,
}) {
  const authorName = post.author?.name || "Author";
  const authorAvatar =
    post.author?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      authorName
    )}`;

  return (
    <div className="mb-4">
      {/* Category & Action Controls */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="blog-badge">{post.category || "General"}</span>

        {canModify && (
          <div className="d-flex align-items-center gap-2">
            <Link
              href={`/posts/edit/${post._id}`}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            >
              <FiEdit3 size={14} /> Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            >
              <FiTrash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Post Title */}
      <h1
        className="fw-bolder mb-3 text-dark"
        style={{ fontSize: "2.3rem", lineHeight: "1.25" }}
      >
        {post.title}
      </h1>

      {/* Author Strip & Metadata */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 py-3 border-top border-bottom">
        <div className="d-flex align-items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <div className="fw-bold">{authorName}</div>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              {post.author?.bio || "DevBlog Contributor"}
            </div>
          </div>
        </div>

        <div
          className="d-flex align-items-center gap-3 text-muted"
          style={{ fontSize: "13px" }}
        >
          <span className="d-flex align-items-center gap-1">
            <FiCalendar /> {dayjs(post.createdAt).format("MMMM D, YYYY")}
          </span>
          <span className="d-flex align-items-center gap-1">
            <FiClock /> {readTime} min read
          </span>
          <span className="d-flex align-items-center gap-1">
            <FiEye /> {post.views || 0} views
          </span>
          <button
            type="button"
            onClick={onShare}
            className="btn btn-sm btn-light border-0 text-muted p-1"
            title="Share Article"
          >
            <FiShare2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
