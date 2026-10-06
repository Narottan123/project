"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { postsApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import CommentsSection from "@/components/blog/CommentsSection";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiClock,
  FiEye,
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await postsApi.getPostBySlug(slug);
        if (res.data?.success) {
          setPost(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Article not found.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await postsApi.deletePost(post._id);
      if (res.data?.success) {
        toast.success("Post deleted successfully");
        router.push("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-muted">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-bold mb-3">Article Not Found</h3>
        <p className="text-muted mb-4">{error || "The post you are looking for does not exist or has been removed."}</p>
        <Link href="/" className="blog-btn-primary">
          <FiArrowLeft /> Back to Feed
        </Link>
      </div>
    );
  }

  const isAuthor =
    user &&
    (post.author?._id === user._id ||
      post.author === user._id ||
      post.author?._id === user.id);
  const canModify = isAuthor || isAdmin;

  const wordCount = post.content ? post.content.split(/\s+/).length : 100;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="container py-5" style={{ maxWidth: "860px" }}>
      {/* Back button */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link href="/" className="text-decoration-none text-muted d-inline-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
          <FiArrowLeft /> Back to articles
        </Link>

        {canModify && (
          <div className="d-flex align-items-center gap-2">
            <Link
              href={`/posts/edit/${post._id}`}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            >
              <FiEdit3 size={14} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            >
              <FiTrash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Meta header */}
      <div className="mb-3">
        <span className="blog-badge mb-2">{post.category || "General"}</span>
        <h1 className="fw-bolder mb-3" style={{ fontSize: "2.4rem", lineHeight: "1.25" }}>
          {post.title}
        </h1>

        {/* Author card strip */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 py-3 border-top border-bottom">
          <div className="d-flex align-items-center gap-3">
            <img
              src={
                post.author?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  post.author?.name || "Author"
                )}`
              }
              alt={post.author?.name}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <div className="fw-bold">{post.author?.name || "Author"}</div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {post.author?.bio || "DevBlog Contributor"}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: "13px" }}>
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
              onClick={handleShare}
              className="btn btn-sm btn-light border-0 text-muted p-1"
              title="Share Article"
            >
              <FiShare2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-4 rounded-4 overflow-hidden shadow-sm" style={{ maxHeight: "450px" }}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-100 h-100 object-fit-cover"
          />
        </div>
      )}

      {/* Main Content */}
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

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2 pt-3 border-top mb-5">
          <span className="text-muted fw-semibold me-2" style={{ fontSize: "13px" }}>Tags:</span>
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

      {/* Discussions & Comments Section */}
      <CommentsSection postId={post._id} />
    </div>
  );
}
