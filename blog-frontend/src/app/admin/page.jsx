"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminRoute from "@/components/common/AdminRoute";
import { adminApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { FiHome } from "react-icons/fi";
import {
  AdminSidebar,
  AdminMetrics,
  OverviewTab,
  RolesTab,
  UsersTable,
  PostsTable,
  CommentsTable,
  AuditLogsTable,
} from "@/components/admin";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [stats, setStats] = useState(null);

  // Users Data & Pagination
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  // Posts Data & Pagination
  const [posts, setPosts] = useState([]);
  const [postSearch, setPostSearch] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(1);
  const [postTotal, setPostTotal] = useState(0);

  // Comments Data & Pagination
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);

  // Audit Logs & Pagination
  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logTotal, setLogTotal] = useState(0);

  // Role Permissions Data
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.data?.success) {
        setStats(res.data.data.stats);
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await adminApi.getRoles();
      if (res.data?.success) {
        setRoles(res.data.data || []);
      }
    } catch (e) {
      console.error("Failed to load roles:", e);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await adminApi.getPermissions();
      if (res.data?.success) {
        setPermissions(res.data.data || []);
      }
    } catch (e) {
      console.error("Failed to load permissions:", e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminApi.getUsers({
        search: userSearch,
        page: userPage,
        limit: 10,
      });
      if (res.data?.success) {
        setUsers(res.data.data || []);
        if (res.data.extra) {
          setUserTotal(res.data.extra.total || 0);
          setUserTotalPages(res.data.extra.totalPages || 1);
        }
      }
    } catch (e) {
      toast.error("Failed to fetch users");
    }
  }, [userSearch, userPage]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await adminApi.getPosts({
        search: postSearch,
        isDeleted: "all",
        page: postPage,
        limit: 10,
      });
      if (res.data?.success) {
        setPosts(res.data.data || []);
        if (res.data.extra) {
          setPostTotal(res.data.extra.total || 0);
          setPostTotalPages(res.data.extra.totalPages || 1);
        }
      }
    } catch (e) {
      toast.error("Failed to fetch posts");
    }
  }, [postSearch, postPage]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await adminApi.getComments({
        page: commentPage,
        limit: 10,
      });
      if (res.data?.success) {
        setComments(res.data.data || []);
        if (res.data.extra) {
          setCommentTotal(res.data.extra.total || 0);
          setCommentTotalPages(res.data.extra.totalPages || 1);
        }
      }
    } catch (e) {
      toast.error("Failed to fetch comments");
    }
  }, [commentPage]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminApi.getLogs({
        page: logPage,
        limit: 10,
      });
      if (res.data?.success) {
        setLogs(res.data.data || []);
        if (res.data.extra) {
          setLogTotal(res.data.extra.total || 0);
          setLogTotalPages(res.data.extra.totalPages || 1);
        }
      }
    } catch (e) {
      toast.error("Failed to fetch audit logs");
    }
  }, [logPage]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRoles();
    fetchPermissions();
  }, [fetchDashboardStats, fetchRoles, fetchPermissions]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Permission Action Handlers
  const handleTogglePermission = (role, feature, permKey) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (
          item.role.toLowerCase() === role.toLowerCase() &&
          item.feature.toLowerCase() === feature.toLowerCase()
        ) {
          return {
            ...item,
            permissions: {
              ...item.permissions,
              [permKey]: !item.permissions?.[permKey],
            },
          };
        }
        return item;
      })
    );
  };

  const handleToggleFeatureAll = (role, feature, nextVal) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (
          item.role.toLowerCase() === role.toLowerCase() &&
          item.feature.toLowerCase() === feature.toLowerCase()
        ) {
          return {
            ...item,
            permissions: {
              create: nextVal,
              view: nextVal,
              update: nextVal,
              delete: nextVal,
            },
          };
        }
        return item;
      })
    );
  };

  const handleSavePermissions = async () => {
    setSavingPermissions(true);
    try {
      const roleItems = permissions.filter(
        (p) => p.role.toLowerCase() === selectedRole.toLowerCase()
      );
      const res = await adminApi.updatePermissions(roleItems);
      if (res.data?.success) {
        setPermissions(res.data.data || []);
        toast.success(
          `Permissions updated successfully for ${selectedRole.toUpperCase()}`
        );
      }
    } catch (e) {
      toast.error("Failed to save permissions");
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleGrantAllForRole = (role) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (item.role.toLowerCase() === role.toLowerCase()) {
          return {
            ...item,
            permissions: { create: true, view: true, update: true, delete: true },
          };
        }
        return item;
      })
    );
    toast.info(`All permissions enabled for ${role.toUpperCase()}`);
  };

  const handleRevokeAllForRole = (role) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (item.role.toLowerCase() === role.toLowerCase()) {
          return {
            ...item,
            permissions: {
              create: false,
              view: false,
              update: false,
              delete: false,
            },
          };
        }
        return item;
      })
    );
    toast.info(`All permissions disabled for ${role.toUpperCase()}`);
  };

  const handleCreateRole = async (e) => {
    e?.preventDefault();
    if (!newRoleForm.name.trim()) {
      toast.warning("Role name is required");
      return;
    }
    try {
      const res = await adminApi.createRole(newRoleForm);
      if (res.data?.success) {
        toast.success(`Role '${res.data.data.name}' created successfully`);
        setNewRoleForm({ name: "", code: "", description: "" });
        setNewRoleModal(false);
        await Promise.all([fetchRoles(), fetchPermissions()]);
        setSelectedRole(res.data.data.code);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create role");
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!confirm(`Are you sure you want to delete role '${roleName}'?`)) return;
    try {
      const res = await adminApi.deleteRole(roleId);
      if (res.data?.success) {
        toast.success(`Role '${roleName}' deleted successfully`);
        await Promise.all([fetchRoles(), fetchPermissions()]);
        setSelectedRole("admin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
  };

  // User Actions
  const handleAssignUserRole = async (userId, targetRoleCode, targetRoleId) => {
    try {
      const res = await adminApi.updateUser(userId, {
        role: targetRoleCode,
        role_id: targetRoleId,
      });
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, role: targetRoleCode, role_id: res.data.data.role_id }
              : u
          )
        );
        toast.success(`Role updated to ${targetRoleCode.toUpperCase()}`);
        fetchRoles();
      }
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await adminApi.toggleUserStatus(userId, !currentStatus);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isActive: !currentStatus } : u
          )
        );
        toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
      }
    } catch (e) {
      toast.error("Failed to change user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user?"))
      return;
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.data?.success) {
        toast.success("User deleted");
        fetchUsers();
      }
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  // Post Actions
  const handleRestorePost = async (postId) => {
    try {
      const res = await adminApi.restorePost(postId);
      if (res.data?.success) {
        toast.success("Post restored successfully");
        fetchPosts();
      }
    } catch (e) {
      toast.error("Failed to restore post");
    }
  };

  const handlePermanentDeletePost = async (postId) => {
    if (
      !confirm(
        "This will permanently remove this post and cannot be undone. Proceed?"
      )
    )
      return;
    try {
      const res = await adminApi.hardDeletePost(postId);
      if (res.data?.success) {
        toast.success("Post permanently deleted");
        fetchPosts();
      }
    } catch (e) {
      toast.error("Failed to delete post");
    }
  };

  // Comment Actions
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment permanently?")) return;
    try {
      const res = await adminApi.deleteComment(commentId);
      if (res.data?.success) {
        toast.success("Comment deleted");
        fetchComments();
      }
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <AdminRoute>
      <div className="crm-admin-wrapper">
        <div className="crm-body-container">
          {/* Left Sidebar Menu */}
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Area */}
          <main className="crm-main-content">
            {/* Breadcrumb */}
            <div className="crm-breadcrumb">
              <FiHome className="text-warning" size={15} />
              <span>Admin</span>
              <span>&gt;</span>
              <span className="crm-breadcrumb-current">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "roles" && "Roles"}
                {activeTab === "users" && "Users"}
                {activeTab === "posts" && "Posts"}
                {activeTab === "comments" && "Comments"}
                {activeTab === "logs" && "Audit Activity Logs"}
              </span>
            </div>

            {/* Row of 4 Metric Cards */}
            <AdminMetrics
              stats={stats}
              usersCount={userTotal || users.length}
              postsCount={postTotal || posts.length}
              commentsCount={commentTotal || comments.length}
              publishedCount={posts.filter((p) => !p.isDeleted).length}
            />

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <OverviewTab
                posts={posts}
                postSearch={postSearch}
                setPostSearch={(val) => {
                  setPostSearch(val);
                  setPostPage(1);
                }}
                handleRestorePost={handleRestorePost}
                handlePermanentDeletePost={handlePermanentDeletePost}
              />
            )}

            {/* TAB 2: ROLE PERMISSIONS */}
            {activeTab === "roles" && (
              <RolesTab
                roles={roles}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                permissions={permissions}
                handleTogglePermission={handleTogglePermission}
                handleRowToggleAll={handleToggleFeatureAll}
                handleGrantAllForRole={handleGrantAllForRole}
                handleRevokeAllForRole={handleRevokeAllForRole}
                handleSavePermissions={handleSavePermissions}
                savingPermissions={savingPermissions}
                newRoleModal={newRoleModal}
                setNewRoleModal={setNewRoleModal}
                newRoleForm={newRoleForm}
                setNewRoleForm={setNewRoleForm}
                handleCreateRole={handleCreateRole}
                handleDeleteRole={handleDeleteRole}
              />
            )}

            {/* TAB 3: MANAGE USERS */}
            {activeTab === "users" && (
              <UsersTable
                users={users}
                roles={roles}
                userSearch={userSearch}
                setUserSearch={(val) => {
                  setUserSearch(val);
                  setUserPage(1);
                }}
                handleAssignUserRole={handleAssignUserRole}
                handleToggleUserStatus={handleToggleUserStatus}
                handleDeleteUser={handleDeleteUser}
                page={userPage}
                totalPages={userTotalPages}
                total={userTotal}
                limit={10}
                onPageChange={(p) => setUserPage(p)}
              />
            )}

            {/* TAB 4: MANAGE POSTS */}
            {activeTab === "posts" && (
              <PostsTable
                posts={posts}
                postSearch={postSearch}
                setPostSearch={(val) => {
                  setPostSearch(val);
                  setPostPage(1);
                }}
                handleRestorePost={handleRestorePost}
                handlePermanentDeletePost={handlePermanentDeletePost}
                page={postPage}
                totalPages={postTotalPages}
                total={postTotal}
                limit={10}
                onPageChange={(p) => setPostPage(p)}
              />
            )}

            {/* TAB 5: COMMENTS MANAGEMENT */}
            {activeTab === "comments" && (
              <CommentsTable
                comments={comments}
                handleDeleteComment={handleDeleteComment}
                page={commentPage}
                totalPages={commentTotalPages}
                total={commentTotal}
                limit={10}
                onPageChange={(p) => setCommentPage(p)}
              />
            )}

            {/* TAB 6: AUDIT LOGS */}
            {activeTab === "logs" && (
              <AuditLogsTable
                logs={logs}
                page={logPage}
                totalPages={logTotalPages}
                total={logTotal}
                limit={10}
                onPageChange={(p) => setLogPage(p)}
              />
            )}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
