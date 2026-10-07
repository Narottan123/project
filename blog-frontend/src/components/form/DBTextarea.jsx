"use client";

import React, { forwardRef } from "react";

/**
 * DBTextarea - Reusable Textarea Component
 *
 * @param {string} label - Field label
 * @param {string} name - Textarea name attribute
 * @param {string} value - Textarea value
 * @param {Function} onChange - Change handler
 * @param {number} rows - Number of text rows
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether textarea is required
 * @param {string} error - Validation error message
 * @param {string|React.ReactNode} helperText - Helper description under textarea
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Wrapper container class
 * @param {string} textareaClassName - Custom class on the <textarea>
 * @param {string} id - HTML id (defaults to name)
 */
const DBTextarea = forwardRef(function DBTextarea(
  {
    label,
    name,
    value,
    onChange,
    rows = 4,
    placeholder,
    required = false,
    error,
    helperText,
    disabled = false,
    className = "",
    textareaClassName = "",
    id,
    ...props
  },
  ref
) {
  const textareaId = id || name;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="form-label fw-bold d-flex align-items-center gap-1"
          style={{ fontSize: "14px" }}
        >
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-control ${error ? "is-invalid" : ""} ${textareaClassName}`}
        style={{ fontSize: "14px", padding: "10px 12px" }}
        {...props}
      />

      {error && (
        <div className="invalid-feedback d-block mt-1" style={{ fontSize: "12px" }}>
          {error}
        </div>
      )}

      {helperText && !error && (
        <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
          {helperText}
        </div>
      )}
    </div>
  );
});

export { DBTextarea };
export default DBTextarea;
