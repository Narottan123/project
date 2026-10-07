"use client";

import React, { forwardRef } from "react";

/**
 * DBSelect - Reusable Dropdown Component
 *
 * @param {string} label - Field label
 * @param {string} name - Select name attribute
 * @param {string|number} value - Selected value
 * @param {Function} onChange - Change handler
 * @param {Array} options - Array of string values OR objects [{ value, label }]
 * @param {string} placeholder - Default placeholder/empty option
 * @param {boolean} required - Whether select is required
 * @param {string} error - Validation error message
 * @param {string|React.ReactNode} helperText - Helper text under select
 * @param {React.ReactNode} icon - Left icon
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Wrapper container class
 * @param {string} selectClassName - Custom class on the <select>
 * @param {string} id - HTML id (defaults to name)
 */
const DBSelect = forwardRef(function DBSelect(
  {
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder,
    required = false,
    error,
    helperText,
    icon,
    disabled = false,
    className = "",
    selectClassName = "",
    id,
    ...props
  },
  ref
) {
  const selectId = id || name;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`form-select border-start-0 ${
              error ? "is-invalid" : ""
            } ${selectClassName}`}
            style={{ fontSize: "14px", padding: "8px 12px" }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt, idx) => {
              const optVal = typeof opt === "object" ? opt.value : opt;
              const optLabel = typeof opt === "object" ? opt.label : opt;
              return (
                <option key={idx} value={optVal}>
                  {optLabel}
                </option>
              );
            })}
          </select>
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
      ) : (
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-select ${error ? "is-invalid" : ""} ${selectClassName}`}
          style={{ fontSize: "14px", padding: "8px 12px" }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={idx} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
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

export { DBSelect };
export default DBSelect;
