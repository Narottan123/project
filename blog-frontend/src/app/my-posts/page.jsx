"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MyPostsTable from "@/components/blog/MyPostsTable";
import { postsApi } from "@/service/api";
import { toast } from "react-toastify";
import { FiPlus, FiBookOpen } from "react-icons/fi";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMyPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postsApi.getMyPosts({ page, limit: 10 });
      if (res.data?.success) {
        setPosts(res.data.data || []);
        if (res.data.extra) {
          setTotal(res.data.extra.total || 0);
          setTotalPages(res.data.extra.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching my posts:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await postsApi.deletePost(postId);
      if (res.data?.success) {
        toast.success("Article deleted");
        fetchMyPosts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete article");
    }
  };

  const breadcrumbItems = [{ label: "My Articles" }];

  return (
    <ProtectedRoute>
      <div className="container py-4" style={{ maxWidth: "960px" }}>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          title="My Articles"
          description="Manage, track, and edit all articles written by you."
          action={
            <Link href="/posts/create" className="blog-btn-primary">
              <FiPlus size={16} /> Write New Article
            </Link>
          }
        />

        {/* Main Content Area */}
        {loading ? (
          <LoadingSpinner message="Loading your articles..." />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<FiBookOpen size={48} />}
            title="You haven't written any articles yet"
            description="Share your engineering insights, tutorials, or stories with the community today."
            action={
              <Link href="/posts/create" className="blog-btn-primary">
                <FiPlus size={16} /> Create Your First Post
              </Link>
            }
          />
        ) : (
          <MyPostsTable
            posts={posts}
            onDelete={handleDelete}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={10}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
