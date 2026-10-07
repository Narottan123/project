"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { postsApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import PostHeader from "@/components/blog/PostHeader";
import PostContent from "@/components/blog/PostContent";
import CommentsSection from "@/components/blog/CommentsSection";
import { toast } from "react-toastify";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";

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
    return <LoadingSpinner message="Loading article..." minHeight="50vh" />;
  }

  if (error || !post) {
    return (
      <div className="container py-5" style={{ maxWidth: "700px" }}>
        <EmptyState
          icon={<FiAlertCircle size={48} className="text-danger" />}
          title="Article Not Found"
          description={
            error ||
            "The post you are looking for does not exist or has been removed."
          }
          action={
            <Link href="/" className="blog-btn-primary">
              <FiArrowLeft /> Back to Feed
            </Link>
          }
        />
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

  const breadcrumbItems = [
    { label: "Articles", href: "/" },
    { label: post.title },
  ];

  return (
    <div className="container py-4" style={{ maxWidth: "860px" }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Post Header (Title, Author, Actions, Metadata) */}
      <PostHeader
        post={post}
        canModify={canModify}
        onDelete={handleDelete}
        onShare={handleShare}
        readTime={readTime}
      />

      {/* Post Body & Media */}
      <PostContent post={post} />

      {/* Real-time Threaded Discussions */}
      <CommentsSection postId={post._id} />
    </div>
  );
}
