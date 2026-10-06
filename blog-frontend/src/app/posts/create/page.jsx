"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { postsApi } from "@/service/api";
import { toast } from "react-toastify";
import { FiArrowLeft, FiImage, FiTag, FiFileText } from "react-icons/fi";
import Link from "next/link";

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Technology",
    tags: "",
    coverImage: "",
    status: "published",
  });
  const [submitting, setSubmitting] = useState(false);

  const slugPreview = formData.title
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      toast.error("Content must be at least 10 characters");
      return;
    }

    try {
      setSubmitting(true);
      const res = await postsApi.createPost(formData);
      if (res.data?.success) {
        toast.success("Post created successfully!");
        const newSlug = res.data.data.slug;
        router.push(`/posts/${newSlug}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <div className="mb-4">
          <Link href="/" className="text-decoration-none text-muted d-inline-flex align-items-center gap-1 mb-2" style={{ fontSize: "14px" }}>
            <FiArrowLeft /> Back to Feed
          </Link>
          <h2 className="fw-bolder">Create New Article</h2>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Publish your latest thoughts, tutorials, or deep dives to the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="blog-card p-4 p-md-5">
          {/* Title */}
          <div className="mb-3">
            <label className="form-label fw-bold" style={{ fontSize: "14px" }}>
              Article Title *
            </label>
            <input
              type="text"
              name="title"
              className="form-control py-2"
              placeholder="e.g. Architecting Scalable REST APIs with Node.js"
              value={formData.title}
              onChange={handleChange}
              required
              style={{ fontSize: "15px" }}
            />
            {slugPreview && (
              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                Slug URL: <code>/posts/{slugPreview}</code>
              </div>
            )}
          </div>

          {/* Category & Status */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold" style={{ fontSize: "14px" }}>
                Category
              </label>
              <select
                name="category"
                className="form-select py-2"
                value={formData.category}
                onChange={handleChange}
                style={{ fontSize: "14px" }}
              >
                <option value="Technology">Technology</option>
                <option value="Security">Security</option>
                <option value="Architecture">Architecture</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Career">Career</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold" style={{ fontSize: "14px" }}>
                Publish Status
              </label>
              <select
                name="status"
                className="form-select py-2"
                value={formData.status}
                onChange={handleChange}
                style={{ fontSize: "14px" }}
              >
                <option value="published">Published (Public)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
              <FiTag /> Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              className="form-control py-2"
              placeholder="e.g. React, NodeJS, Express, Architecture"
              value={formData.tags}
              onChange={handleChange}
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* Cover Image URL */}
          <div className="mb-3">
            <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
              <FiImage /> Cover Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              className="form-control py-2"
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImage}
              onChange={handleChange}
              style={{ fontSize: "14px" }}
            />
            {formData.coverImage && (
              <div className="mt-2 rounded-3 overflow-hidden" style={{ maxHeight: "160px" }}>
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="mb-3">
            <label className="form-label fw-bold" style={{ fontSize: "14px" }}>
              Summary / Short Excerpt
            </label>
            <input
              type="text"
              name="excerpt"
              className="form-control py-2"
              placeholder="A 1-2 sentence hook for post cards and search previews..."
              value={formData.excerpt}
              onChange={handleChange}
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* Full Content */}
          <div className="mb-4">
            <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
              <FiFileText /> Article Body *
            </label>
            <textarea
              name="content"
              rows="12"
              className="form-control"
              placeholder="Write your article markdown or plain text here..."
              value={formData.content}
              onChange={handleChange}
              required
              style={{ fontSize: "15px", lineHeight: "1.6" }}
            />
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-3 pt-3 border-top">
            <Link href="/" className="blog-btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="blog-btn-primary"
            >
              {submitting ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
