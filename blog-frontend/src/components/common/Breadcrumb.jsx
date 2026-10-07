"use client";

import React from "react";
import Link from "next/link";
import { FiHome, FiChevronRight } from "react-icons/fi";

/**
 * Reusable Breadcrumb Component
 * @param {Array} items - [{ label: string, href?: string, icon?: ReactNode }]
 */
export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0 align-items-center" style={{ fontSize: "13px" }}>
        <li className="breadcrumb-item d-flex align-items-center">
          <Link
            href="/"
            className="text-decoration-none text-muted d-inline-flex align-items-center gap-1 hover-primary"
          >
            <FiHome size={13} />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li className="breadcrumb-item-separator text-muted px-2" style={{ fontSize: "11px" }}>
                <FiChevronRight />
              </li>
              <li
                className={`breadcrumb-item d-flex align-items-center ${
                  isLast ? "active text-dark fw-semibold" : ""
                }`}
                aria-current={isLast ? "page" : undefined}
                style={{
                  maxWidth: isLast ? "320px" : "auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={item.label}
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-decoration-none text-muted hover-primary d-inline-flex align-items-center gap-1"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="d-inline-flex align-items-center gap-1">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
