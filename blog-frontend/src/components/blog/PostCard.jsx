import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { FiClock, FiMessageSquare } from "react-icons/fi";

export default function PostCard({ post }) {
  if (!post) return null;

  const defaultImage =
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80";

  // Calculate approximate read time (200 words per minute)
  const wordCount = post.content ? post.content.split(/\s+/).length : 100;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="blog-card">
        <Link href={`/posts/${post.slug}`} className="text-decoration-none">
          <div className="blog-card-img-wrapper">
            <img
              src={post.coverImage || defaultImage}
              alt={post.title}
              className="blog-card-img"
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />
          </div>
        </Link>

        <div className="p-4 d-flex flex-column flex-grow-1">
          {/* Category & Date */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="blog-badge">{post.category || "General"}</span>
            <span className="text-muted" style={{ fontSize: "12px" }}>
              {dayjs(post.createdAt).format("MMM D, YYYY")}
            </span>
          </div>

          {/* Title */}
          <h5 className="fw-bold mb-2" style={{ lineHeight: "1.4" }}>
            <Link
              href={`/posts/${post.slug}`}
              className="text-decoration-none text-dark"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.title}
            </Link>
          </h5>

          {/* Excerpt */}
          <p
            className="text-muted mb-4 flex-grow-1"
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt || post.content?.slice(0, 120) + "..."}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="badge-neutral"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author & Read Time footer */}
          <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
            <div className="d-flex align-items-center gap-2">
              <img
                src={
                  post.author?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                    post.author?.name || "Author"
                  )}`
                }
                alt={post.author?.name || "Author"}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span className="fw-semibold text-truncate" style={{ fontSize: "13px", maxWidth: "120px" }}>
                {post.author?.name || "Anonymous"}
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: "12px" }}>
              <span className="d-flex align-items-center gap-1">
                <FiClock size={13} />
                {readTime}m read
              </span>
              {post.views !== undefined && (
                <span title="Views">👁 {post.views}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
