"use client";

import React from "react";
import { FiSave, FiCheckSquare } from "react-icons/fi";

const FEATURE_DESCRIPTIONS = {
  users: "User accounts, role assignments and active/banned status controls",
  posts: "Blog articles creation, editing, trash and restoration",
  comments: "Discussions, comment moderation and deletion",
  categories: "Taxonomy categories, tags and content grouping",
  logs: "Security tracking, audit actions and system telemetry",
};

/**
 * RolesTab Component - Dynamic Role & Permissions Matrix
 */
export default function RolesTab({
  roles = [],
  selectedRole,
  setSelectedRole,
  permissions = [],
  handleTogglePermission,
  handleRowToggleAll,
  handleGrantAllForRole,
  handleRevokeAllForRole,
  handleSavePermissions,
  savingPermissions,
  newRoleModal,
  setNewRoleModal,
  newRoleForm,
  setNewRoleForm,
  handleCreateRole,
  handleDeleteRole,
}) {
  const currentRoleObj = roles.find((r) => r.code === selectedRole);

  const displayedRoles =
    roles.length > 0
      ? roles
      : [
          { code: "admin", name: "Admin" },
          { code: "user", name: "User" },
        ];

  return (
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
            {displayedRoles.map((r) => (
              <button
                key={r.code || r._id}
                type="button"
                onClick={() => setSelectedRole(r.code)}
                className={`perm-role-btn ${
                  selectedRole === r.code ? "active" : ""
                }`}
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
        <form
          onSubmit={handleCreateRole}
          className="p-3 mb-3 border rounded bg-light"
        >
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
              <label className="form-label small text-muted mb-1">
                Code / Slug
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. editor"
                value={newRoleForm.code}
                onChange={(e) =>
                  setNewRoleForm((prev) => ({
                    ...prev,
                    code: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_-]/g, "_"),
                  }))
                }
                required
              />
            </div>
            <div className="col-md-5">
              <label className="form-label small text-muted mb-1">
                Description
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Can manage blog posts and comments"
                value={newRoleForm.description}
                onChange={(e) =>
                  setNewRoleForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
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
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
          Role:{" "}
          <strong className="text-uppercase text-dark">{selectedRole}</strong>
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
              onClick={() =>
                handleDeleteRole(currentRoleObj._id, currentRoleObj.name)
              }
              className="btn btn-sm btn-outline-danger py-1 px-2"
              style={{ fontSize: "0.8rem" }}
              title="Delete custom role"
            >
              Delete Role
            </button>
          )}
        </div>
      </div>

      {/* Permission Matrix Table */}
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
                  <tr key={item._id || `${item.role}_${item.feature}`}>
                    <td className="fw-semibold text-muted">{idx + 1}</td>
                    <td>
                      <div className="fw-bold text-dark text-capitalize">
                        {item.feature}
                      </div>
                      <div className="text-muted" style={{ fontSize: "11px" }}>
                        {FEATURE_DESCRIPTIONS[item.feature] ||
                          `Permissions for ${item.feature}`}
                      </div>
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!item.permissions?.create}
                        onChange={() =>
                          handleTogglePermission(
                            item.role,
                            item.feature,
                            "create"
                          )
                        }
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!item.permissions?.view}
                        onChange={() =>
                          handleTogglePermission(item.role, item.feature, "view")
                        }
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!item.permissions?.update}
                        onChange={() =>
                          handleTogglePermission(
                            item.role,
                            item.feature,
                            "update"
                          )
                        }
                      />
                    </td>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!item.permissions?.delete}
                        onChange={() =>
                          handleTogglePermission(
                            item.role,
                            item.feature,
                            "delete"
                          )
                        }
                      />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleRowToggleAll(
                            item.role,
                            item.feature,
                            !allChecked
                          )
                        }
                        className={`btn btn-sm ${
                          allChecked
                            ? "btn-success"
                            : "btn-outline-secondary"
                        } py-0 px-2`}
                        style={{ fontSize: "11px", borderRadius: "4px" }}
                        title={
                          allChecked
                            ? "Revoke all actions for this feature"
                            : "Grant all actions for this feature"
                        }
                      >
                        <FiCheckSquare size={12} className="me-1" />
                        {allChecked ? "All" : "None"}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Footer with Save Action */}
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="text-muted small">
          Active Role: <span className="fw-bold">{selectedRole}</span> • Total
          Features:{" "}
          <span className="fw-bold">
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
  );
}
