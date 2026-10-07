"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageHeader from "@/components/common/PageHeader";
import PostForm from "@/components/blog/PostForm";
import { postsApi } from "@/service/api";
import { toast } from "react-toastify";

export default function CreatePostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
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

  const breadcrumbItems = [
    { label: "Articles", href: "/" },
    { label: "Create Article" },
  ];

  return (
    <ProtectedRoute>
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          title="Create New Article"
          description="Publish your latest thoughts, tutorials, or deep dives to the community."
        />

        {/* Reusable Form */}
        <PostForm
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Publish Article"
        />
      </div>
    </ProtectedRoute>
  );
}
