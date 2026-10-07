import React from "react";

/**
 * Reusable EmptyState Component
 * @param {React.ReactNode} icon - Centered icon
 * @param {string} title - Heading
 * @param {string} description - Explanation
 * @param {React.ReactNode} action - Action button or link
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="blog-card p-5 text-center my-4">
      {icon && <div className="text-muted mb-3">{icon}</div>}
      <h4 className="fw-bold mb-2">{title}</h4>
      {description && (
        <p className="text-muted mb-4 mx-auto" style={{ fontSize: "14px", maxWidth: "480px" }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
