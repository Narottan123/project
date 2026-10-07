"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PostForm from "@/components/blog/PostForm";
import { postsApi } from "@/service/api";
import { toast } from "react-toastify";

export default function EditPostPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await postsApi.getPostById(id);
        if (res.data?.success) {
          setPost(res.data.data);
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

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await postsApi.updatePost(id, formData);
      if (res.data?.success) {
        toast.success("Post updated successfully!");
        const updatedSlug = res.data.data.slug || post.slug;
        router.push(`/posts/${updatedSlug}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "My Articles", href: "/my-posts" },
    { label: post?.title || "Edit Article", href: post?.slug ? `/posts/${post.slug}` : undefined },
    { label: "Edit" },
  ];

  return (
    <ProtectedRoute>
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          title="Edit Article"
          description="Update your article content, metadata, or visibility status."
        />

        {/* Content Body */}
        {loading ? (
          <LoadingSpinner message="Loading article for editing..." />
        ) : post ? (
          <PostForm
            initialData={post}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Update Article"
          />
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
