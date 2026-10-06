"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { postsApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiBookOpen,
} from "react-icons/fi";

export default function MyPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postsApi.getMyPosts();
      if (res.data?.success) {
        setPosts(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching my posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await postsApi.deletePost(postId);
      if (res.data?.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Article deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete article");
    }
  };

  return (
    <ProtectedRoute>
      <div className="container py-5" style={{ maxWidth: "960px" }}>
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
          <div>
            <h2 className="fw-bolder mb-1">My Articles</h2>
            <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
              Manage and track all articles written by you.
            </p>
          </div>
          <Link href="/posts/create" className="blog-btn-primary">
            <FiPlus size={16} /> Write New Article
          </Link>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="blog-card p-5 text-center my-4">
            <FiBookOpen size={48} className="text-muted mb-3" />
            <h4 className="fw-bold mb-2">You haven&apos;t written any articles yet</h4>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Share your engineering insights, tutorials, or stories with the community today.
            </p>
            <Link href="/posts/create" className="blog-btn-primary">
              <FiPlus size={16} /> Create Your First Post
            </Link>
          </div>
        ) : (
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
                            onClick={() => handleDelete(post._id)}
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
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
