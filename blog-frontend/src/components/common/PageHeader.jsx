import React from "react";

/**
 * Reusable PageHeader Component
 * @param {string} title - Page headline
 * @param {string} description - Subtitle/description
 * @param {React.ReactNode} action - Right-aligned action buttons/links
 * @param {React.ReactNode} badge - Optional badge above or next to title
 */
export default function PageHeader({ title, description, action, badge, border = true }) {
  return (
    <div
      className={`d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 ${
        border ? "pb-3 border-bottom" : ""
      }`}
    >
      <div>
        {badge && <div className="mb-2">{badge}</div>}
        <h2 className="fw-bolder mb-1 text-dark" style={{ fontSize: "1.75rem" }}>
          {title}
        </h2>
        {description && (
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            {description}
          </p>
        )}
      </div>

      {action && <div className="d-flex align-items-center gap-2">{action}</div>}
    </div>
  );
}
