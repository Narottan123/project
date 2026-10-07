"use client";

import React, { useState, useEffect, useCallback } from "react";
import { commentsApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  FiMessageSquare,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiCornerDownRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiCheck,
} from "react-icons/fi";

dayjs.extend(relativeTime);

// Helper: Check if comment exists anywhere in tree
function hasCommentInTree(nodes, id) {
  if (!Array.isArray(nodes)) return false;
  for (const node of nodes) {
    if (node._id === id) return true;
    if (node.replies && hasCommentInTree(node.replies, id)) return true;
  }
  return false;
}

// Helper: Recursively insert comment into tree
function insertCommentIntoTree(nodes, newComment) {
  if (!newComment.parentId) {
    if (hasCommentInTree(nodes, newComment._id)) return nodes;
    return [{ ...newComment, replies: newComment.replies || [] }, ...nodes];
  }

  return nodes.map((node) => {
    if (node._id === newComment.parentId) {
      const existingReplies = node.replies || [];
      if (existingReplies.some((r) => r._id === newComment._id)) {
        return node;
      }
      return {
        ...node,
        replies: [
          ...existingReplies,
          { ...newComment, replies: newComment.replies || [] },
        ],
      };
    }
    if (node.replies && node.replies.length > 0) {
      return {
        ...node,
        replies: insertCommentIntoTree(node.replies, newComment),
      };
    }
    return node;
  });
}

// Helper: Recursively update comment in tree
function updateCommentInTree(nodes, updatedComment) {
  return nodes.map((node) => {
    if (node._id === updatedComment._id) {
      return {
        ...node,
        ...updatedComment,
        replies: node.replies || [],
      };
    }
    if (node.replies && node.replies.length > 0) {
      return {
        ...node,
        replies: updateCommentInTree(node.replies, updatedComment),
      };
    }
    return node;
  });
}

// Helper: Recursively delete comment from tree
function deleteCommentFromTree(nodes, commentId) {
  return nodes
    .filter((node) => node._id !== commentId)
    .map((node) => {
      if (node.replies && node.replies.length > 0) {
        return {
          ...node,
          replies: deleteCommentFromTree(node.replies, commentId),
        };
      }
      return node;
    });
}

// Helper: Count total comments (root + all nested replies)
function countTotalComments(nodes) {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((total, node) => {
    return total + 1 + countTotalComments(node.replies || []);
  }, 0);
}

// Recursive Comment Node Component
function CommentNode({
  comment,
  user,
  isAdmin,
  isAuthenticated,
  editingId,
  editContent,
  setEditingId,
  setEditContent,
  handleUpdate,
  handleDelete,
  replyingToId,
  setReplyingToId,
  replyContent,
  setReplyContent,
  handleReplySubmit,
  submittingReply,
  collapsedMap,
  toggleCollapse,
  depth = 0,
}) {
  const isAuthor =
    user &&
    (comment.author?._id === user._id ||
      comment.author === user._id ||
      comment.author?._id === user.id ||
      comment.author === user.id);
  const canManage = isAuthor || isAdmin;
  const authorName = comment.author?.name || "User";
  const authorAvatar =
    comment.author?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      authorName
    )}`;
  const isStaff = comment.author?.role === "admin";
  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const isCollapsed = !!collapsedMap[comment._id];
  const isReplying = replyingToId === comment._id;
  const isEditing = editingId === comment._id;

  return (
    <div className="comment-thread-wrapper">
      <div className={`comment-bubble ${depth > 0 ? "is-reply" : ""}`}>
        {/* Header: Author + Timestamp + Actions */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              style={{
                width: depth === 0 ? "36px" : "30px",
                height: depth === 0 ? "36px" : "30px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <div className="d-flex align-items-center gap-1">
                <span className="fw-bold" style={{ fontSize: "13px" }}>
                  {authorName}
                </span>
                {isStaff && (
                  <span
                    className="badge bg-primary"
                    style={{ fontSize: "10px", padding: "2px 6px" }}
                  >
                    Staff
                  </span>
                )}
              </div>
              <div className="text-muted" style={{ fontSize: "11px" }}>
                {dayjs(comment.createdAt).fromNow()}
                <span className="mx-1">•</span>
                {dayjs(comment.createdAt).format("MMM D, YYYY • h:mm A")}
              </div>
            </div>
          </div>

          {/* Edit / Delete actions */}
          {canManage && !isEditing && (
            <div className="d-flex gap-1">
              {isAuthor && (
                <button
                  type="button"
                  className="comment-action-btn"
                  onClick={() => {
                    setEditingId(comment._id);
                    setEditContent(comment.content);
                  }}
                  title="Edit Comment"
                >
                  <FiEdit2 size={13} />
                  <span>Edit</span>
                </button>
              )}
              <button
                type="button"
                className="comment-action-btn delete-btn"
                onClick={() => handleDelete(comment._id)}
                title="Delete Comment"
              >
                <FiTrash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Form or Comment Body */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="form-control mb-2"
              rows="3"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ fontSize: "14px" }}
              autoFocus
            />
            <div className="d-flex gap-2">
              <button
                className="blog-btn-primary py-1 px-3"
                style={{ fontSize: "13px" }}
                onClick={() => handleUpdate(comment._id)}
              >
                <FiCheck size={13} />
                Save
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ borderRadius: "8px" }}
                onClick={() => {
                  setEditingId(null);
                  setEditContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {comment.replyToUser && (
              <span className="comment-mention-tag">
                <FiCornerDownRight size={11} />
                @{comment.replyToUser?.name || "User"}
              </span>
            )}
            <p
              className="mb-2 text-dark"
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
              }}
            >
              {comment.content}
            </p>
          </div>
        )}

        {/* Footer Actions: Reply button & Collapse Toggle */}
        {!isEditing && (
          <div className="d-flex align-items-center justify-content-between pt-1 border-top mt-2">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="comment-action-btn"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info("Please sign in to reply");
                    return;
                  }
                  if (isReplying) {
                    setReplyingToId(null);
                    setReplyContent("");
                  } else {
                    setReplyingToId(comment._id);
                    setReplyContent("");
                  }
                }}
              >
                <FiCornerDownRight size={13} />
                <span>{isReplying ? "Cancel Reply" : "Reply"}</span>
              </button>

              {hasReplies && (
                <button
                  type="button"
                  className="comment-toggle-replies-btn"
                  onClick={() => toggleCollapse(comment._id)}
                >
                  {isCollapsed ? (
                    <>
                      <FiChevronDown size={14} />
                      <span>
                        Show {replies.length}{" "}
                        {replies.length === 1 ? "reply" : "replies"}
                      </span>
                    </>
                  ) : (
                    <>
                      <FiChevronUp size={14} />
                      <span>
                        Hide {replies.length}{" "}
                        {replies.length === 1 ? "reply" : "replies"}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inline Reply Composer */}
      {isReplying && (
        <div className="comment-reply-composer ms-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span
              className="text-muted fw-semibold"
              style={{ fontSize: "12px" }}
            >
              Replying to{" "}
              <strong className="text-primary">@{authorName}</strong>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-0"
              onClick={() => {
                setReplyingToId(null);
                setReplyContent("");
              }}
            >
              <FiX size={15} />
            </button>
          </div>
          <textarea
            className="form-control mb-2"
            rows="2"
            placeholder={`Write your reply to ${authorName}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            style={{ fontSize: "13px", borderRadius: "8px" }}
            autoFocus
          />
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => {
                setReplyingToId(null);
                setReplyContent("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="blog-btn-primary py-1 px-3"
              style={{ fontSize: "13px" }}
              disabled={submittingReply || !replyContent.trim()}
              onClick={() => handleReplySubmit(comment)}
            >
              <FiSend size={13} />
              <span>{submittingReply ? "Posting..." : "Post Reply"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && !isCollapsed && (
        <div className="comment-thread-replies">
          {replies.map((reply) => (
            <CommentNode
              key={reply._id}
              comment={reply}
              user={user}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              editingId={editingId}
              editContent={editContent}
              setEditingId={setEditingId}
              setEditContent={setEditContent}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReplySubmit={handleReplySubmit}
              submittingReply={submittingReply}
              collapsedMap={collapsedMap}
              toggleCollapse={toggleCollapse}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ postId }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Reply state
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Collapse state for subthreads
  const [collapsedMap, setCollapsedMap] = useState({});

  const toggleCollapse = (id) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  // Real-time socket listener for new comments and nested replies
  useEffect(() => {
    if (!socket || !postId) return;

    socket.emit("join_post", postId);

    const handleNewComment = (data) => {
      if (data.postId === postId && data.comment) {
        setComments((prev) => insertCommentIntoTree(prev, data.comment));
      }
    };

    socket.on(`new_comment_${postId}`, handleNewComment);

    return () => {
      socket.emit("leave_post", postId);
      socket.off(`new_comment_${postId}`, handleNewComment);
    };
  }, [socket, postId]);

  // Submit top-level comment
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
        const created = res.data.data;
        setComments((prev) => insertCommentIntoTree(prev, created));
        toast.success("Comment added!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit nested reply
  const handleReplySubmit = async (parentComment) => {
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await commentsApi.createComment(postId, {
        content: replyContent.trim(),
        parentId: parentComment._id,
        replyToUser: parentComment.author?._id || parentComment.author,
      });

      if (res.data?.success) {
        setReplyContent("");
        setReplyingToId(null);
        const created = res.data.data;
        setComments((prev) => insertCommentIntoTree(prev, created));
        // Make sure parent is expanded so user sees their new reply
        setCollapsedMap((prev) => ({
          ...prev,
          [parentComment._id]: false,
        }));
        toast.success("Reply posted!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Update comment
  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await commentsApi.updateComment(commentId, {
        content: editContent.trim(),
      });
      if (res.data?.success) {
        setComments((prev) => updateCommentInTree(prev, res.data.data));
        setEditingId(null);
        setEditContent("");
        toast.success("Comment updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    if (
      !confirm(
        "Are you sure you want to delete this comment? Any direct replies will also be removed."
      )
    ) {
      return;
    }

    try {
      const res = await commentsApi.deleteComment(commentId);
      if (res.data?.success) {
        setComments((prev) => deleteCommentFromTree(prev, commentId));
        toast.success("Comment deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const totalCommentsCount = countTotalComments(comments);

  return (
    <div className="mt-5 pt-4 border-top">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <FiMessageSquare size={22} className="text-primary" />
          <h4 className="fw-bold mb-0">
            Discussions ({totalCommentsCount})
          </h4>
        </div>
      </div>

      {/* Add Top-Level Comment Form */}
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
          style={{
            background: "#f8fafc",
            border: "1px dashed var(--blog-border)",
          }}
        >
          <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
            Sign in to join the conversation and leave a comment.
          </p>
          <a href="/login" className="blog-btn-primary py-2 px-4">
            Sign In to Comment
          </a>
        </div>
      )}

      {/* Threaded Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div
          className="text-center py-4 text-muted"
          style={{ fontSize: "14px" }}
        >
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="d-flex flex-column">
          {comments.map((comment) => (
            <CommentNode
              key={comment._id}
              comment={comment}
              user={user}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              editingId={editingId}
              editContent={editContent}
              setEditingId={setEditingId}
              setEditContent={setEditContent}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReplySubmit={handleReplySubmit}
              submittingReply={submittingReply}
              collapsedMap={collapsedMap}
              toggleCollapse={toggleCollapse}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
