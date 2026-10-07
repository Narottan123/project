"use client";

import React, { useState } from "react";
import { DBInput, DBSelect, DBTextarea } from "@/components/form";
import { FiImage, FiTag, FiSend, FiSave } from "react-icons/fi";

const CATEGORIES = [
  "Technology",
  "Programming",
  "Design",
  "Career",
  "DevOps",
  "AI & ML",
  "Tutorial",
  "General",
];

const STATUS_OPTIONS = [
  { value: "published", label: "Published (Public)" },
  { value: "draft", label: "Draft (Private)" },
];

/**
 * Reusable PostForm Component for Create & Edit post pages
 * @param {Object} initialData - Default form values
 * @param {Function} onSubmit - Form submit handler (receives formData)
 * @param {boolean} submitting - Loading status
 * @param {string} submitLabel - "Publish Article" or "Update Article"
 */
export default function PostForm({
  initialData = {},
  onSubmit,
  submitting = false,
  submitLabel = "Publish Article",
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    excerpt: initialData.excerpt || "",
    category: initialData.category || "Technology",
    tags: Array.isArray(initialData.tags)
      ? initialData.tags.join(", ")
      : initialData.tags || "",
    coverImage: initialData.coverImage || "",
    status: initialData.status || "published",
  });

  const slugPreview = formData.title
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="blog-card p-4 p-md-5">
      {/* Article Title */}
      <DBInput
        label="Article Title"
        name="title"
        placeholder="e.g. Architecting Scalable REST APIs with Node.js"
        value={formData.title}
        onChange={handleChange}
        required
        helperText={
          slugPreview ? (
            <span>
              Slug URL: <code>/posts/{slugPreview}</code>
            </span>
          ) : null
        }
      />

      {/* Category & Status */}
      <div className="row g-3">
        <div className="col-md-6">
          <DBSelect
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={CATEGORIES}
            required
          />
        </div>

        <div className="col-md-6">
          <DBSelect
            label="Publication Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {/* Cover Image URL */}
      <DBInput
        label="Cover Image URL"
        name="coverImage"
        type="url"
        placeholder="https://images.unsplash.com/..."
        value={formData.coverImage}
        onChange={handleChange}
        icon={<FiImage size={15} />}
      />

      {formData.coverImage && (
        <div
          className="mb-3 rounded-3 overflow-hidden border"
          style={{ maxHeight: "160px" }}
        >
          <img
            src={formData.coverImage}
            alt="Cover Preview"
            className="w-100 h-100 object-fit-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Tags */}
      <DBInput
        label="Tags (Comma separated)"
        name="tags"
        placeholder="react, nodejs, javascript, backend"
        value={formData.tags}
        onChange={handleChange}
        icon={<FiTag size={15} />}
      />

      {/* Short Summary / Excerpt */}
      <DBTextarea
        label="Short Summary / Excerpt"
        name="excerpt"
        rows={2}
        placeholder="A quick 1-2 sentence overview shown on post cards..."
        value={formData.excerpt}
        onChange={handleChange}
      />

      {/* Article Content */}
      <DBTextarea
        label="Article Content (Markdown / Plain Text)"
        name="content"
        rows={12}
        placeholder="Write your article content here..."
        value={formData.content}
        onChange={handleChange}
        required
      />

      {/* Submit Button */}
      <div className="d-flex justify-content-end gap-3 pt-3 border-top">
        <button
          type="submit"
          disabled={submitting}
          className="blog-btn-primary py-2 px-4"
        >
          {submitLabel.includes("Update") ? (
            <FiSave size={16} />
          ) : (
            <FiSend size={16} />
          )}
          <span>{submitting ? "Saving..." : submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
