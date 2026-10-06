"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { postsApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";
import { FiArrowLeft, FiImage, FiTag, FiFileText } from "react-icons/fi";

export default function EditPostPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "General",
    tags: "",
    coverImage: "",
    status: "published",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await postsApi.getPostById(id);
        if (res.data?.success) {
          const p = res.data.data;
          setFormData({
            title: p.title || "",
            content: p.content || "",
            excerpt: p.excerpt || "",
            category: p.category || "General",
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
            coverImage: p.coverImage || "",
            status: p.status || "published",
          });
        }
      } catch (err) {
        toast.error("Failed to load article");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const res = await postsApi.updatePost(id, formData);
      if (res.data?.success) {
        toast.success("Post updated successfully!");
        router.push(`/posts/${res.data.data.slug}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update article");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container py-5" style={{ maxWidth: "800px" }}>
        <div className="mb-4">
          <Link href="/" className="text-decoration-none text-muted d-inline-flex align-items-center gap-1 mb-2" style={{ fontSize: "14px" }}>
            <FiArrowLeft /> Back
          </Link>
          <h2 className="fw-bolder">Edit Article</h2>
        </div>

        <form onSubmit={handleSubmit} className="blog-card p-4 p-md-5">
          <div className="mb-3">
            <label className="form-label fw-bold" style={{ fontSize: "14px" }}>
              Title
            </label>
            <input
              type="text"
              name="title"
              className="form-control py-2"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

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
                Status
              </label>
              <select
                name="status"
                className="form-select py-2"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
              <FiTag /> Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              className="form-control py-2"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
              <FiImage /> Cover Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              className="form-control py-2"
              value={formData.coverImage}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold" style={{ fontSize: "14px" }}>
              Excerpt
            </label>
            <input
              type="text"
              name="excerpt"
              className="form-control py-2"
              value={formData.excerpt}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold d-flex align-items-center gap-1" style={{ fontSize: "14px" }}>
              <FiFileText /> Body Content
            </label>
            <textarea
              name="content"
              rows="12"
              className="form-control"
              value={formData.content}
              onChange={handleChange}
              required
              style={{ fontSize: "15px", lineHeight: "1.6" }}
            />
          </div>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top">
            <button
              type="button"
              onClick={() => router.back()}
              className="blog-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="blog-btn-primary"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
