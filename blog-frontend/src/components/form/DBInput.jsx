"use client";

import React, { forwardRef } from "react";

/**
 * DBInput - Reusable Form Input Component
 *
 * @param {string} label - Input label
 * @param {string} name - Input name attribute
 * @param {string} type - Input type (text, email, password, url, number, etc.)
 * @param {string|number} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether input is required
 * @param {string} error - Validation error message
 * @param {string|React.ReactNode} helperText - Helper description under input
 * @param {React.ReactNode} icon - Left icon inside or beside input
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Wrapper container class
 * @param {string} inputClassName - Custom class on the <input>
 * @param {string} id - HTML id (defaults to name)
 */
const DBInput = forwardRef(function DBInput(
  {
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    error,
    helperText,
    icon,
    disabled = false,
    className = "",
    inputClassName = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || name;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="form-label fw-bold d-flex align-items-center gap-1"
          style={{ fontSize: "14px" }}
        >
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      {icon ? (
        <div className="input-group">
          <span className="input-group-text bg-white text-muted border-end-0">
            {icon}
          </span>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`form-control border-start-0 ${
              error ? "is-invalid" : ""
            } ${inputClassName}`}
            style={{ fontSize: "14px", padding: "8px 12px" }}
            {...props}
          />
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
      ) : (
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-control ${error ? "is-invalid" : ""} ${inputClassName}`}
          style={{ fontSize: "14px", padding: "8px 12px" }}
          {...props}
        />
      )}

      {error && !icon && (
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

export { DBInput };
export default DBInput;
