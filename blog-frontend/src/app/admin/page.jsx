"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminRoute from "@/components/common/AdminRoute";
import { adminApi } from "@/service/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiShield,
  FiActivity,
  FiTrash2,
  FiRotateCcw,
  FiCheckCircle,
  FiHome,
  FiGrid,
  FiDownload,
  FiBriefcase,
  FiSearch,
  FiSave,
  FiCheckSquare,
} from "react-icons/fi";

const FEATURE_DESCRIPTIONS = {
  users: "User accounts, role assignments and active/banned status controls",
  posts: "Blog articles creation, editing, trash and restoration",
  comments: "Discussions, comment moderation and deletion",
  categories: "Taxonomy categories, tags and content grouping",
  logs: "Security tracking, audit actions and system telemetry",
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [stats, setStats] = useState(null);

  // Users Data
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  // Posts Data
  const [posts, setPosts] = useState([]);
  const [postSearch, setPostSearch] = useState("");

  // Comments Data
  const [comments, setComments] = useState([]);

  // Audit Logs
  const [logs, setLogs] = useState([]);

  // Role Permissions Data
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", code: "", description: "" });

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
      const res = await adminApi.getUsers({ search: userSearch });
      if (res.data?.success) {
        setUsers(res.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to fetch users");
    }
  }, [userSearch]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await adminApi.getPosts({ search: postSearch, isDeleted: "all" });
      if (res.data?.success) {
        setPosts(res.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to fetch posts");
    }
  }, [postSearch]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await adminApi.getComments();
      if (res.data?.success) {
        setComments(res.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to fetch comments");
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminApi.getLogs();
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (e) {
      toast.error("Failed to fetch audit logs");
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    fetchRoles();
    fetchPermissions();
    fetchUsers();
    fetchPosts();
    fetchComments();
    fetchLogs();
  }, [fetchDashboardStats, fetchRoles, fetchPermissions, fetchUsers, fetchPosts, fetchComments, fetchLogs]);

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

  const handleToggleFeatureAll = (role, feature) => {
    setPermissions((prev) =>
      prev.map((item) => {
        if (
          item.role.toLowerCase() === role.toLowerCase() &&
          item.feature.toLowerCase() === feature.toLowerCase()
        ) {
          const allTrue =
            item.permissions?.create &&
            item.permissions?.view &&
            item.permissions?.update &&
            item.permissions?.delete;
          const nextVal = !allTrue;
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
            permissions: { create: false, view: false, update: false, delete: false },
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

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await adminApi.updateUser(userId, { role: newRole });
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`User role changed to ${newRole}`);
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
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
        toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
      }
    } catch (e) {
      toast.error("Failed to change user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.data?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        toast.success("User deleted");
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
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, isDeleted: false, deletedAt: null } : p))
        );
        toast.success("Post restored successfully");
      }
    } catch (e) {
      toast.error("Failed to restore post");
    }
  };

  const handlePermanentDeletePost = async (postId) => {
    if (!confirm("This will permanently remove this post and cannot be undone. Proceed?")) return;
    try {
      const res = await adminApi.hardDeletePost(postId);
      if (res.data?.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Post permanently deleted");
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
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted");
      }
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <AdminRoute>
      <div className="crm-admin-wrapper">
        {/* Body Container: Sidebar + Main Content */}
        <div className="crm-body-container">
          {/* Left Sidebar Menu Matching Screenshot */}
          <aside className="crm-sidebar d-none d-md-flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`crm-sidebar-item ${activeTab === "overview" ? "active" : ""}`}
            >
              <FiGrid size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`crm-sidebar-item ${activeTab === "roles" ? "active" : ""}`}
            >
              <FiBriefcase size={18} />
              <span>Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`crm-sidebar-item ${activeTab === "users" ? "active" : ""}`}
            >
              <FiUsers size={18} />
              <span>Users</span>
            </button>

            <button
              onClick={() => setActiveTab("posts")}
              className={`crm-sidebar-item ${activeTab === "posts" ? "active" : ""}`}
            >
              <FiFileText size={18} />
              <span>Manage Posts</span>
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={`crm-sidebar-item ${activeTab === "comments" ? "active" : ""}`}
            >
              <FiMessageSquare size={18} />
              <span>Comments</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`crm-sidebar-item ${activeTab === "logs" ? "active" : ""}`}
            >
              <FiShield size={18} />
              <span>Audit Logs</span>
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="crm-main-content">
            {/* Breadcrumb Matching Screenshot */}
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

            {/* Row of 5 Metric Cards (Exact Match to Screenshot) */}
            <div className="crm-metrics-grid">
              {/* Card 1: Coral */}
              <div className="crm-metric-card card-coral">
                <div>
                  <div className="crm-metric-label">Total Users</div>
                  <div className="crm-metric-number">
                    {stats?.totalUsers ?? users.length ?? 105}
                  </div>
                </div>
                <div className="crm-metric-icon-circle">
                  <FiUsers />
                </div>
              </div>

              {/* Card 2: Blue */}
              <div className="crm-metric-card card-blue">
                <div>
                  <div className="crm-metric-label">Total Posts</div>
                  <div className="crm-metric-number">
                    {stats?.totalPosts ?? posts.length ?? 184}
                  </div>
                </div>
                <div className="crm-metric-icon-circle">
                  <FiFileText />
                </div>
              </div>

              {/* Card 3: Green */}
              <div className="crm-metric-card card-green">
                <div>
                  <div className="crm-metric-label">Total Comments</div>
                  <div className="crm-metric-number">
                    {stats?.totalComments ?? comments.length ?? 437}
                  </div>
                </div>
                <div className="crm-metric-icon-circle">
                  <FiMessageSquare />
                </div>
              </div>

              {/* Card 4: Yellow */}
              <div className="crm-metric-card card-yellow">
                <div>
                  <div className="crm-metric-label">Published Posts</div>
                  <div className="crm-metric-number">
                    {stats?.totalPublishedPosts ?? posts.filter((p) => !p.isDeleted).length ?? 432}
                  </div>
                </div>
                <div className="crm-metric-icon-circle">
                  <FiCheckCircle />
                </div>
              </div>

              {/* Card 5: Purple */}
              <div className="crm-metric-card card-purple">
                <div>
                  <div className="crm-metric-label">You may connect</div>
                  <div className="d-flex align-items-center gap-1 mt-2">
                    <span className="badge bg-success" style={{ fontSize: "11px" }}>
                      SE &rarr; PIXEL CONN
                    </span>
                  </div>
                </div>
                <div className="crm-metric-icon-circle">
                  <FiActivity />
                </div>
              </div>
            </div>

            {/* TAB 1: OVERVIEW & POSTS MANAGEMENT */}
            {activeTab === "overview" && (
              <div className="crm-table-card">
                <div className="crm-table-card-header">
                  <div>
                    <h3 className="crm-table-title">Time logs & Timesheet</h3>
                    <p className="crm-table-subtitle">Overview of logged hours and timesheet entries</p>
                  </div>
                  <div className="crm-table-filters">
                    <input
                      type="text"
                      className="crm-search-pill"
                      placeholder="Accounts (NULL)"
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                    />
                    <select className="crm-search-pill">
                      <option>October</option>
                      <option>September</option>
                      <option>August</option>
                    </select>
                    <button className="crm-export-btn" type="button">
                      <FiDownload size={14} /> Export &or;
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>S/L</th>
                        <th>Article Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.slice(0, 8).map((p, idx) => (
                        <tr key={p._id}>
                          <td className="fw-semibold">{idx + 1}</td>
                          <td>
                            <Link href={`/posts/${p.slug}`} className="text-decoration-none text-dark fw-semibold">
                              {p.title}
                            </Link>
                          </td>
                          <td className="text-muted">{p.author?.name || "Author"}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{p.category || "General"}</span>
                          </td>
                          <td>
                            {p.isDeleted ? (
                              <span className="badge bg-danger">Absent / Deleted</span>
                            ) : (
                              <span className="badge bg-success">Published</span>
                            )}
                          </td>
                          <td className="text-muted">{dayjs(p.createdAt).format("DD/MM ddd")}</td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              {p.isDeleted ? (
                                <button
                                  onClick={() => handleRestorePost(p._id)}
                                  className="btn btn-sm btn-outline-success p-1"
                                  title="Restore post"
                                >
                                  <FiRotateCcw size={13} />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handlePermanentDeletePost(p._id)}
                                className="btn btn-sm btn-outline-danger p-1"
                                title="Delete post"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <span className="text-danger fw-bold" style={{ fontSize: "14px" }}>
                    Total Entries: {posts.length}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: ROLE PERMISSIONS */}
            {activeTab === "roles" && (
              <div className="crm-table-card">
                {/* Header with Title and Role Selector + Save Button */}
                <div className="crm-table-card-header">
                  <div>
                    <h3 className="crm-table-title">Role Permissions</h3>
                    <p className="crm-table-subtitle">
                      Configure feature access permissions for user roles
                    </p>
                  </div>
                  <div className="crm-table-filters d-flex align-items-center gap-2">
                    <div className="d-flex gap-1 flex-wrap align-items-center">
                      {(roles.length > 0
                        ? roles
                        : [
                            { code: "admin", name: "Admin" },
                            { code: "user", name: "User" },
                          ]
                      ).map((r) => (
                        <button
                          key={r.code || r._id}
                          type="button"
                          onClick={() => setSelectedRole(r.code)}
                          className={`perm-role-btn ${selectedRole === r.code ? "active" : ""}`}
                        >
                          {r.name}
                          {r.userCount !== undefined && (
                            <span className="opacity-75 ms-1" style={{ fontSize: "11px" }}>
                              ({r.userCount})
                            </span>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewRoleModal(!newRoleModal)}
                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                        style={{ fontSize: "0.82rem", borderRadius: "6px" }}
                        title="Add new role to role_master"
                      >
                        + New Role
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="crm-export-btn"
                    >
                      <FiSave size={14} />
                      {savingPermissions ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                {/* Inline Add Role Form */}
                {newRoleModal && (
                  <form onSubmit={handleCreateRole} className="p-3 mb-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark">Add New Dynamic Role</h6>
                      <button
                        type="button"
                        onClick={() => setNewRoleModal(false)}
                        className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="row g-2 align-items-end">
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">Role Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Content Editor"
                          value={newRoleForm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewRoleForm((prev) => ({
                              ...prev,
                              name: val,
                              code: prev.code
                                ? prev.code
                                : val.toLowerCase().replace(/[^a-z0-9_-]/g, "_"),
                            }));
                          }}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small text-muted mb-1">Code / Slug</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. editor"
                          value={newRoleForm.code}
                          onChange={(e) =>
                            setNewRoleForm((prev) => ({
                              ...prev,
                              code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "_"),
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small text-muted mb-1">Description</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Can manage blog posts and comments"
                          value={newRoleForm.description}
                          onChange={(e) =>
                            setNewRoleForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-3 d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        onClick={() => setNewRoleModal(false)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-sm btn-dark">
                        Create Role
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-bar with role indicator and simple Check All / Uncheck All */}
                {(() => {
                  const currentRoleObj = roles.find((r) => r.code === selectedRole);
                  return (
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        Role: <strong className="text-uppercase text-dark">{selectedRole}</strong>
                        {currentRoleObj?.description && (
                          <span className="ms-2 text-muted" style={{ fontSize: "0.8rem" }}>
                            — {currentRoleObj.description}
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <button
                          type="button"
                          onClick={() => handleGrantAllForRole(selectedRole)}
                          className="btn btn-sm btn-light border py-1 px-2"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Check All
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeAllForRole(selectedRole)}
                          className="btn btn-sm btn-light border py-1 px-2"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Uncheck All
                        </button>
                        {currentRoleObj && !currentRoleObj.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(currentRoleObj._id, currentRoleObj.name)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            style={{ fontSize: "0.8rem" }}
                            title="Delete custom role"
                          >
                            Delete Role
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Table */}
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>#</th>
                        <th style={{ minWidth: "220px" }}>Feature</th>
                        <th className="text-center" style={{ width: "120px" }}>
                          Create
                        </th>
                        <th className="text-center" style={{ width: "120px" }}>
                          View
                        </th>
                        <th className="text-center" style={{ width: "120px" }}>
                          Edit
                        </th>
                        <th className="text-center" style={{ width: "120px" }}>
                          Delete
                        </th>
                        <th className="text-center" style={{ width: "100px" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions
                        .filter(
                          (p) => p.role.toLowerCase() === selectedRole.toLowerCase()
                        )
                        .map((item, idx) => {
                          const allChecked =
                            item.permissions?.create &&
                            item.permissions?.view &&
                            item.permissions?.update &&
                            item.permissions?.delete;

                          return (
                            <tr key={`${item.role}-${item.feature}`}>
                              <td className="text-muted fw-semibold">
                                {idx + 1}
                              </td>
                              <td>
                                <div className="fw-semibold text-dark">
                                  {item.featureLabel || item.feature}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.78rem" }}
                                >
                                  {FEATURE_DESCRIPTIONS[item.feature.toLowerCase()] ||
                                    `Manage ${item.feature}`}
                                </div>
                              </td>

                              {/* CREATE */}
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="perm-check-input"
                                  checked={!!item.permissions?.create}
                                  onChange={() =>
                                    handleTogglePermission(
                                      selectedRole,
                                      item.feature,
                                      "create"
                                    )
                                  }
                                />
                              </td>

                              {/* VIEW */}
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="perm-check-input"
                                  checked={!!item.permissions?.view}
                                  onChange={() =>
                                    handleTogglePermission(
                                      selectedRole,
                                      item.feature,
                                      "view"
                                    )
                                  }
                                />
                              </td>

                              {/* EDIT (UPDATE) */}
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="perm-check-input"
                                  checked={!!item.permissions?.update}
                                  onChange={() =>
                                    handleTogglePermission(
                                      selectedRole,
                                      item.feature,
                                      "update"
                                    )
                                  }
                                />
                              </td>

                              {/* DELETE */}
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="perm-check-input"
                                  checked={!!item.permissions?.delete}
                                  onChange={() =>
                                    handleTogglePermission(
                                      selectedRole,
                                      item.feature,
                                      "delete"
                                    )
                                  }
                                />
                              </td>

                              {/* ACTION */}
                              <td className="text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleFeatureAll(selectedRole, item.feature)
                                  }
                                  className="btn btn-sm btn-link text-decoration-none p-0"
                                  style={{ fontSize: "0.8rem", color: "#d96534" }}
                                >
                                  {allChecked ? "Clear" : "All"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Bar */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    Total Features:{" "}
                    <span className="fw-bold text-dark">
                      {
                        permissions.filter(
                          (p) => p.role.toLowerCase() === selectedRole.toLowerCase()
                        ).length
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={savingPermissions}
                    className="crm-export-btn"
                  >
                    <FiSave size={14} />
                    {savingPermissions ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: MANAGE USERS */}
            {activeTab === "users" && (
              <div className="crm-table-card">
                <div className="crm-table-card-header">
                  <div>
                    <h3 className="crm-table-title">Users Management</h3>
                    <p className="crm-table-subtitle">Manage user permissions and active statuses</p>
                  </div>
                  <div className="crm-table-filters">
                    <input
                      type="text"
                      className="crm-search-pill"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                    <button className="crm-export-btn" type="button">
                      <FiDownload size={14} /> Export Users
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>S/L</th>
                        <th>User Name</th>
                        <th>Email Address</th>
                        <th>Role</th>
                        <th>Account Status</th>
                        <th>Registered Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={u._id}>
                          <td className="fw-semibold">{idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                                alt={u.name}
                                style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                              />
                              <span className="fw-semibold">{u.name}</span>
                            </div>
                          </td>
                          <td className="text-muted">{u.email}</td>
                          <td>
                            <select
                              value={u.role_id?._id || u.role_id || u.role}
                              onChange={(e) => {
                                const selected = roles.find(
                                  (r) => r._id === e.target.value || r.code === e.target.value
                                );
                                if (selected) {
                                  handleAssignUserRole(u._id, selected.code, selected._id);
                                } else {
                                  handleAssignUserRole(u._id, e.target.value, null);
                                }
                              }}
                              className="form-select form-select-sm py-0 px-2"
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                width: "auto",
                                display: "inline-block",
                                borderColor: "#cbd5e1",
                                borderRadius: "6px",
                              }}
                            >
                              {(roles.length > 0
                                ? roles
                                : [
                                    { _id: "admin", code: "admin", name: "ADMIN" },
                                    { _id: "user", code: "user", name: "USER" },
                                  ]
                              ).map((r) => (
                                <option key={r._id} value={r._id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                              className={`btn btn-sm ${u.isActive ? "btn-success" : "btn-danger"}`}
                              style={{ fontSize: "11px", padding: "2px 8px" }}
                            >
                              {u.isActive ? "ACTIVE" : "SUSPENDED"}
                            </button>
                          </td>
                          <td className="text-muted">{dayjs(u.createdAt).format("DD/MM/YYYY")}</td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="btn btn-sm btn-outline-danger p-1"
                              title="Delete user"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: MANAGE POSTS */}
            {activeTab === "posts" && (
              <div className="crm-table-card">
                <div className="crm-table-card-header">
                  <div>
                    <h3 className="crm-table-title">Manage Articles</h3>
                    <p className="crm-table-subtitle">Review, moderate, and manage all articles</p>
                  </div>
                  <div className="crm-table-filters">
                    <input
                      type="text"
                      className="crm-search-pill"
                      placeholder="Filter posts..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                    />
                    <button className="crm-export-btn" type="button">
                      <FiDownload size={14} /> Export Posts
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>S/L</th>
                        <th>Article Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Soft Deleted?</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((p, idx) => (
                        <tr key={p._id}>
                          <td className="fw-semibold">{idx + 1}</td>
                          <td>
                            <Link href={`/posts/${p.slug}`} className="text-decoration-none text-dark fw-semibold">
                              {p.title}
                            </Link>
                          </td>
                          <td className="text-muted">{p.author?.name || "Author"}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{p.category || "General"}</span>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{p.status}</span>
                          </td>
                          <td>
                            {p.isDeleted ? (
                              <span className="badge bg-danger">Deleted ({dayjs(p.deletedAt).format("MMM D")})</span>
                            ) : (
                              <span className="badge bg-success">Active</span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              {p.isDeleted ? (
                                <button
                                  onClick={() => handleRestorePost(p._id)}
                                  className="btn btn-sm btn-outline-success p-1"
                                  title="Restore post"
                                >
                                  <FiRotateCcw size={13} />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handlePermanentDeletePost(p._id)}
                                className="btn btn-sm btn-outline-danger p-1"
                                title="Permanent delete"
                              >
                                <FiTrash2 size={13} />
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

            {/* TAB 5: COMMENTS MANAGEMENT */}
            {activeTab === "comments" && (
              <div className="crm-table-card">
                <div className="crm-table-card-header">
                  <div>
                    <h3 className="crm-table-title">Manage Comments</h3>
                    <p className="crm-table-subtitle">Live comments moderation across all discussions</p>
                  </div>
                  <div className="crm-table-filters">
                    <button className="crm-export-btn" type="button">
                      <FiDownload size={14} /> Export Comments
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>S/L</th>
                        <th>Comment Content</th>
                        <th>Author</th>
                        <th>Target Post</th>
                        <th>Created Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map((c, idx) => (
                        <tr key={c._id}>
                          <td className="fw-semibold">{idx + 1}</td>
                          <td className="text-truncate" style={{ maxWidth: "320px" }}>{c.content}</td>
                          <td>{c.author?.name || "User"}</td>
                          <td>
                            <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                              {c.post?.title || "Post"}
                            </span>
                          </td>
                          <td className="text-muted">{dayjs(c.createdAt).format("DD/MM/YYYY")}</td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="btn btn-sm btn-outline-danger p-1"
                              title="Delete comment"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: AUDIT LOGS */}
            {activeTab === "logs" && (
              <div className="crm-table-card">
                <div className="crm-table-card-header">
                  <div>
                    <h3 className="crm-table-title">Audit Activity Logs</h3>
                    <p className="crm-table-subtitle">Security telemetry and administrative audit trail</p>
                  </div>
                  <div className="crm-table-filters">
                    <button className="crm-export-btn" type="button">
                      <FiDownload size={14} /> Export Logs
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>S/L</th>
                        <th>Action Performed</th>
                        <th>Initiated By</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, idx) => (
                        <tr key={log._id}>
                          <td className="fw-semibold">{idx + 1}</td>
                          <td>
                            <span className="badge bg-primary">{log.action}</span>
                          </td>
                          <td className="fw-semibold">
                            {log.user?.name ? `${log.user.name} (${log.user.email})` : "System / Guest"}
                          </td>
                          <td className="text-muted font-monospace">{log.ipAddress || "127.0.0.1"}</td>
                          <td className="text-muted">{dayjs(log.createdAt).format("DD/MM/YYYY • h:mm:ss A")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
