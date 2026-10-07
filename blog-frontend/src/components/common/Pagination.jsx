"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Dynamic Pagination Component
 * @param {number} page - Current active page (1-indexed)
 * @param {number} totalPages - Total pages available
 * @param {Function} onPageChange - Callback when a page is selected
 * @param {number} total - Total records count (optional)
 * @param {number} limit - Items per page (default: 10)
 * @param {boolean} showInfo - Whether to show "Showing X to Y of Z" text
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  total,
  limit = 10,
  showInfo = true,
}) {
  if (total === 0) return null;

  const currentPage = Math.max(1, Number(page) || 1);
  const pagesCount = Math.max(1, Number(totalPages) || 1);

  // Compute records window info
  const startItem = total !== undefined ? (currentPage - 1) * limit + 1 : null;
  const endItem =
    total !== undefined ? Math.min(currentPage * limit, total) : null;

  // Generate numbered pagination items with ellipses
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pagesCount; i++) {
      if (
        i === 1 ||
        i === pagesCount ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 mt-3 border-top">
      {/* Informative text */}
      {showInfo && total !== undefined && (
        <div className="text-muted" style={{ fontSize: "13px" }}>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{total}</strong> entries (10 per page)
        </div>
      )}

      {/* Pagination control buttons */}
      <div className="d-flex align-items-center gap-1 ms-auto">
        {/* Previous Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-2 py-1 d-inline-flex align-items-center gap-1"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ fontSize: "12px", borderRadius: "6px" }}
          title="Previous Page"
        >
          <FiChevronLeft size={14} />
          <span className="d-none d-sm-inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="px-2 text-muted"
                style={{ fontSize: "12px" }}
              >
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`btn btn-sm ${
                isActive ? "btn-primary" : "btn-outline-secondary"
              } px-2 py-1`}
              style={{
                fontSize: "12px",
                minWidth: "32px",
                borderRadius: "6px",
                fontWeight: isActive ? "600" : "normal",
              }}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-2 py-1 d-inline-flex align-items-center gap-1"
          disabled={currentPage >= pagesCount}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ fontSize: "12px", borderRadius: "6px" }}
          title="Next Page"
        >
          <span className="d-none d-sm-inline">Next</span>
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
