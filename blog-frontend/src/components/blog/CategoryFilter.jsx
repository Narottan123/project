"use client";

import React from "react";
import { FiFilter } from "react-icons/fi";

/**
 * CategoryFilter Component
 * @param {Array} categories - List of category strings
 * @param {string} selectedCategory - Currently active category
 * @param {Function} onSelectCategory - Category selection callback
 * @param {number} currentCount - Count of currently visible posts
 * @param {number} totalCount - Total matching posts count
 */
export default function CategoryFilter({
  categories = [],
  selectedCategory = "All",
  onSelectCategory,
  currentCount = 0,
  totalCount = 0,
}) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
      <div className="d-flex align-items-center gap-2 overflow-x-auto py-1">
        <span
          className="text-muted d-flex align-items-center gap-1 me-1"
          style={{ fontSize: "13px" }}
        >
          <FiFilter /> Category:
        </span>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`btn btn-sm ${
              selectedCategory === cat ? "btn-primary" : "btn-outline-secondary"
            }`}
            style={{ fontSize: "13px" }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="text-muted" style={{ fontSize: "13px" }}>
        Showing <strong>{currentCount}</strong> of <strong>{totalCount}</strong>{" "}
        posts
      </div>
    </div>
  );
}
