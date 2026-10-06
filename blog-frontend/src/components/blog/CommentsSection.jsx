"use client";

import React, { useState, useEffect, useCallback } from "react";
import { commentsApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { FiMessageSquare, FiEdit2, FiTrash2, FiSend } from "react-icons/fi";

export default function CommentsSection({ postId }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await commentsApi.getComments(postId);
      if (res.data?.success) {
        setComments(res.data.data || []);
      }
    } catch (e) {
      console.error("Fetch comments error:", e);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  // Real-time socket listener for new comments on this specific post
  useEffect(() => {
    if (!socket || !postId) return;

    // Join room for this post
    socket.emit("join_post", postId);

    const handleNewComment = (data) => {
      if (data.postId === postId && data.comment) {
        setComments((prev) => {
          // Avoid duplicate if we just created it
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [data.comment, ...prev];
        });
      }
    };

    socket.on(`new_comment_${postId}`, handleNewComment);

    return () => {
      socket.emit("leave_post", postId);
      socket.off(`new_comment_${postId}`, handleNewComment);
    };
  }, [socket, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await commentsApi.createComment(postId, {
        content: newComment.trim(),
      });
      if (res.data?.success) {
        setNewComment("");
        // Prepend new comment if not already added by socket
        const created = res.data.data;
        setComments((prev) => {
          if (prev.some((c) => c._id === created._id)) return prev;
          return [created, ...prev];
        });
        toast.success("Comment added!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await commentsApi.updateComment(commentId, {
        content: editContent.trim(),
      });
      if (res.data?.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? res.data.data : c))
        );
        setEditingId(null);
        setEditContent("");
        toast.success("Comment updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await commentsApi.deleteComment(commentId);
      if (res.data?.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="mt-5 pt-4 border-top">
      <div className="d-flex align-items-center gap-2 mb-4">
        <FiMessageSquare size={22} className="text-primary" />
        <h4 className="fw-bold mb-0">
          Discussions ({comments.length})
        </h4>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="d-flex gap-3">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  user?.name || "User"
                )}`
              }
              alt={user?.name}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div className="flex-grow-1">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Join the discussion... Share your thoughts, feedback, or questions."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  borderRadius: "12px",
                  borderColor: "var(--blog-border)",
                  fontSize: "14px",
                  resize: "vertical",
                }}
                required
              />
              <div className="d-flex justify-content-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="blog-btn-primary py-2 px-4"
                >
                  <FiSend size={15} />
                  <span>{submitting ? "Posting..." : "Post Comment"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div
          className="p-4 mb-4 text-center rounded-3"
          style={{ background: "#f8fafc", border: "1px dashed var(--blog-border)" }}
        >
          <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
            Sign in to join the conversation and leave a comment.
          </p>
          <a href="/login" className="blog-btn-primary py-2 px-4">
            Sign In to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-muted" style={{ fontSize: "14px" }}>
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {comments.map((comment) => {
            const isAuthor =
              user &&
              (comment.author?._id === user._id || comment.author === user._id || comment.author?._id === user.id);
            const canManage = isAuthor || isAdmin;

            return (
              <div key={comment._id} className="comment-bubble">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={
                        comment.author?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          comment.author?.name || "User"
                        )}`
                      }
                      alt={comment.author?.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="fw-bold" style={{ fontSize: "13px" }}>
                        {comment.author?.name || "User"}
                        {comment.author?.role === "admin" && (
                          <span
                            className="ms-2 badge bg-primary"
                            style={{ fontSize: "10px" }}
                          >
                            Staff
                          </span>
                        )}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        {dayjs(comment.createdAt).format("MMM D, YYYY • h:mm A")}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="d-flex gap-2">
                      {isAuthor && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-muted p-0"
                          onClick={() => {
                            setEditingId(comment._id);
                            setEditContent(comment.content);
                          }}
                          title="Edit Comment"
                        >
                          <FiEdit2 size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => handleDelete(comment._id)}
                        title="Delete Comment"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      className="form-control mb-2"
                      rows="2"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ fontSize: "14px" }}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdate(comment._id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="mb-0 text-dark"
                    style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line" }}
                  >
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
