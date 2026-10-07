"use client";

import React from "react";
import {
  FiGrid,
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiShield,
} from "react-icons/fi";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", icon: FiGrid },
  { id: "roles", label: "Roles", icon: FiBriefcase },
  { id: "users", label: "Users", icon: FiUsers },
  { id: "posts", label: "Manage Posts", icon: FiFileText },
  { id: "comments", label: "Comments", icon: FiMessageSquare },
  { id: "logs", label: "Audit Logs", icon: FiShield },
];

/**
 * AdminSidebar Component
 * @param {string} activeTab - Currently active tab
 * @param {Function} setActiveTab - Tab switcher callback
 */
export default function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="crm-sidebar d-none d-md-flex">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`crm-sidebar-item ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
