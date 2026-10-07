import React from "react";
import {
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiCheckCircle,
} from "react-icons/fi";

/**
 * AdminMetrics Component - Top row of 4 CRM metric indicator cards
 */
export default function AdminMetrics({
  stats,
  usersCount = 0,
  postsCount = 0,
  commentsCount = 0,
  publishedCount = 0,
}) {
  return (
    <div className="crm-metrics-grid">
      {/* Card 1: Coral */}
      <div className="crm-metric-card card-coral">
        <div>
          <div className="crm-metric-label">Total Users</div>
          <div className="crm-metric-number">
            {stats?.totalUsers ?? usersCount}
          </div>
        </div>
        <div className="crm-metric-icon-circle">
          <FiUsers />
        </div>
      </div>

      {/* Card 2: Blue */}
      <div className="crm-metric-card card-blue">
        <div>
          <div className="crm-metric-label">Total Posts</div>
          <div className="crm-metric-number">
            {stats?.totalPosts ?? postsCount}
          </div>
        </div>
        <div className="crm-metric-icon-circle">
          <FiFileText />
        </div>
      </div>

      {/* Card 3: Green */}
      <div className="crm-metric-card card-green">
        <div>
          <div className="crm-metric-label">Total Comments</div>
          <div className="crm-metric-number">
            {stats?.totalComments ?? commentsCount}
          </div>
        </div>
        <div className="crm-metric-icon-circle">
          <FiMessageSquare />
        </div>
      </div>

      {/* Card 4: Yellow */}
      <div className="crm-metric-card card-yellow">
        <div>
          <div className="crm-metric-label">Published Posts</div>
          <div className="crm-metric-number">
            {stats?.totalPublishedPosts ?? publishedCount}
          </div>
        </div>
        <div className="crm-metric-icon-circle">
          <FiCheckCircle />
        </div>
      </div>
    </div>
  );
}
