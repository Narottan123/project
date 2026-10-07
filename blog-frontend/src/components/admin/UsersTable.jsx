import React from "react";
import dayjs from "dayjs";
import { FiTrash2 } from "react-icons/fi";
import Pagination from "@/components/common/Pagination";

/**
 * UsersTable Component
 * Manages user accounts, role assignments, and active/suspended status
 */
export default function UsersTable({
  users = [],
  roles = [],
  userSearch,
  setUserSearch,
  handleAssignUserRole,
  handleToggleUserStatus,
  handleDeleteUser,
  page = 1,
  totalPages = 1,
  total,
  limit = 10,
  onPageChange,
}) {
  const displayedRoles =
    roles.length > 0
      ? roles
      : [
          { _id: "admin", code: "admin", name: "ADMIN" },
          { _id: "user", code: "user", name: "USER" },
        ];

  return (
    <div className="crm-table-card">
      <div className="crm-table-card-header">
        <div>
          <h3 className="crm-table-title">Users Management</h3>
          <p className="crm-table-subtitle">
            Manage user permissions and active statuses
          </p>
        </div>
        <div className="crm-table-filters">
          <input
            type="text"
            className="crm-search-pill"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
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
                      src={
                        u.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          u.name
                        )}`
                      }
                      alt={u.name}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
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
                        (r) =>
                          r._id === e.target.value || r.code === e.target.value
                      );
                      if (selected) {
                        handleAssignUserRole(
                          u._id,
                          selected.code,
                          selected._id
                        );
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
                    {displayedRoles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                    className={`btn btn-sm ${
                      u.isActive ? "btn-success" : "btn-danger"
                    }`}
                    style={{ fontSize: "11px", padding: "2px 8px" }}
                  >
                    {u.isActive ? "ACTIVE" : "SUSPENDED"}
                  </button>
                </td>
                <td className="text-muted">
                  {dayjs(u.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="text-end">
                  <button
                    type="button"
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

      {onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total ?? users.length}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
