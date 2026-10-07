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

/**
 * Standardized reusable paginated JSON response
 * @param {Object} res
 * @param {Array|Object} data
 * @param {Object|String} pagination
 * @param {String} message
 * @param {Object} extraMeta
 */
export const successWithPagination = (
  res,
  data,
  pagination = {},
  message = "Data retrieved successfully",
  extraMeta = {}
) => {
  let list = [];
  let pageMeta = {};
  let successMessage = message;
  let extraData = extraMeta;

  if (typeof pagination === "string") {
    successMessage = pagination;
    pageMeta = {};
  } else if (typeof pagination === "object" && pagination !== null) {
    pageMeta = pagination;
  }

  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object") {
    const arrayKey = ["users", "posts", "comments", "logs", "roles", "items", "data", "list"].find(
      (key) => Array.isArray(data[key])
    );
    if (arrayKey) {
      list = data[arrayKey];
      pageMeta = { ...data, ...pageMeta };
    } else {
      list = [];
    }
  }

  const total = Number(
    pageMeta.total ?? pageMeta.totalItems ?? pageMeta.count ?? list.length
  );
  const page = Math.max(1, Number(pageMeta.page ?? pageMeta.currentPage ?? 1));
  const limit = Math.max(
    1,
    Number(pageMeta.limit ?? pageMeta.perPage ?? (list.length || 10))
  );
  const totalPages = Number(
    pageMeta.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 1)
  );
  const hasNextPage = Boolean(pageMeta.hasNextPage ?? page < totalPages);
  const hasPrevPage = Boolean(pageMeta.hasPrevPage ?? page > 1);

  const extra = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    ...extraData,
  };

  return res.status(200).json({
    success: true,
    message: successMessage,
    status_code: 200,
    data: list,
    extra,
  });
};

export default {
  slugify,
  getPaginationData,
  isValidObjectId,
  createExcerpt,
  successWithPagination,
};

