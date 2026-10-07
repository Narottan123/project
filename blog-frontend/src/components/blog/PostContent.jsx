import React from "react";

/**
 * PostContent Component for Post Detail Page
 * Renders cover image, post body text, and tags list
 */
export default function PostContent({ post }) {
  return (
    <div>
      {/* Cover Image */}
      {post.coverImage && (
        <div
          className="mb-4 rounded-4 overflow-hidden shadow-sm"
          style={{ maxHeight: "450px" }}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-100 h-100 object-fit-cover"
          />
        </div>
      )}

      {/* Main Content Body */}
      <article
        className="mt-4 mb-5"
        style={{
          fontSize: "1.1rem",
          lineHeight: "1.8",
          color: "#334155",
          whiteSpace: "pre-line",
        }}
      >
        {post.content}
      </article>

      {/* Tags Pill List */}
      {post.tags && post.tags.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 pt-3 border-top mb-5">
          <span
            className="text-muted fw-semibold me-2"
            style={{ fontSize: "13px" }}
          >
            Tags:
          </span>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal"
              style={{ fontSize: "12px" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
