"use client";

import React from "react";
import dayjs from "dayjs";
import Pagination from "@/components/common/Pagination";

/**
 * AuditLogsTable Component
 * Displays system security telemetry and administrative activity trail
 */
export default function AuditLogsTable({
  logs = [],
  page = 1,
  totalPages = 1,
  total,
  limit = 10,
  onPageChange,
}) {
  return (
    <div className="crm-table-card">
      <div className="crm-table-card-header">
        <div>
          <h3 className="crm-table-title">Audit Activity Logs</h3>
          <p className="crm-table-subtitle">
            Security telemetry and administrative audit trail
          </p>
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
                  {log.user?.name
                    ? `${log.user.name} (${log.user.email})`
                    : "System / Guest"}
                </td>
                <td className="text-muted font-monospace">
                  {log.ipAddress || "127.0.0.1"}
                </td>
                <td className="text-muted">
                  {dayjs(log.createdAt).format("DD/MM/YYYY • h:mm:ss A")}
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
          total={total ?? logs.length}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
