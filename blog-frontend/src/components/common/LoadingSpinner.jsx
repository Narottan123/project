import React from "react";

/**
 * Reusable LoadingSpinner Component
 * @param {string} message - Optional loading message
 * @param {string} minHeight - Minimum container height
 */
export default function LoadingSpinner({
  message = "Loading...",
  minHeight = "40vh",
}) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center py-5"
      style={{ minHeight }}
    >
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="text-muted mb-0" style={{ fontSize: "14px" }}>{message}</p>}
    </div>
  );
}
