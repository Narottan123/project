import mongoose from "mongoose";

/**
 * Clean blog helper utility functions
 */

/**
 * Generate URL-friendly slug from string
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Calculate pagination offsets and page metadata
 * @param {number} totalItems
 * @param {number} currentPage
 * @param {number} limit
 */
export const getPaginationData = (totalItems = 0, currentPage = 1, limit = 10) => {
  const page = Math.max(1, parseInt(currentPage) || 1);
  const perPage = Math.max(1, parseInt(limit) || 10);
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const skip = (page - 1) * perPage;

  return {
    currentPage: page,
    limit: perPage,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    skip,
  };
};

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Sanitize plain text excerpt from markdown or text
 * @param {string} content
 * @param {number} length
 * @returns {string}
 */
export const createExcerpt = (content = "", length = 160) => {
  if (!content) return "";
  const plain = content.replace(/<[^>]*>/g, "").replace(/[#*_`]/g, "").trim();
  if (plain.length <= length) return plain;
  return plain.substring(0, length) + "...";
};

export default {
  slugify,
  getPaginationData,
  isValidObjectId,
  createExcerpt,
};
