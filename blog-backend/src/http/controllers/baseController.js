import fs from "fs";
import ApiError from "../utils/apiError.js";

class BaseController {
  /**
   * Return the success response
   *
   * @param {Object} response
   * @param {{}} data
   * @param extra
   *
   * @returns json
   */
  success(response, data, extra = null, message = "") {
    let responseData = {};
    responseData.success = true;
    responseData.message = message;
    responseData.status_code = 200;
    //responseData.os_host = os.hostname();
    responseData.data = data ? data : {};
    if (extra) {
      responseData.extra = extra;
    }
    return response.status(200).json(responseData);
  }

  /**
   * Return all error message except validation
   *
   * @param {Object} response
   * @param err
   *
   * @returns json
   */
  error(response, err) {
    if (err instanceof ApiError) {
      return this.errorMessage(response, err.message);
    }
    return response
      .status(500)
      .json({ success: false, message: err instanceof Error ? err.message : err });
  }

  /**
   * Return all error message except validation
   *
   * @param {Object} response
   * @param {String} err
   * @param statusCode
   *
   * @returns json
   */
  errorMessage(response, err, statusCode = 400) {
    return response.status(statusCode).json({
      success: false,
      message: typeof err === "object" ? "Server error!" : err,
    });
  }

  /**
   * Return validation error message
   *
   * @param {Object} response
   * @param {Result<ValidationError>} errors
   *
   * @returns json
   */
  validationError(response, errors) {
    return response
      .status(400)
      .json({ success: false, message: errors.array()[0]["msg"] });
  }

  /**
   *
   * @param {Object} res
   * @param {Array} data
   */


  /**
   *
   * @param {Object} res
   * @param {Array} data
   */
  /**
   * Return paginated success response
   *
   * @param {Object} res - Express response object
   * @param {Array|Object} data - Array of records OR result object containing data and pagination
   * @param {Object|String} pagination - Pagination metadata { total, page, limit, totalPages } OR message if data contains metadata
   * @param {String} message - Response message
   * @param {Object} extraMeta - Additional metadata to append to extra
   *
   * @returns JSON response
   */
  successWithPagination(res, data, pagination = {}, message = "Data retrieved successfully", extraMeta = {}) {
    let list = [];
    let pageMeta = {};
    let successMessage = message;
    let extraData = extraMeta;

    // Handle flexible argument order: if 3rd arg is string, treat as message
    if (typeof pagination === "string") {
      successMessage = pagination;
      pageMeta = {};
    } else if (typeof pagination === "object" && pagination !== null) {
      pageMeta = pagination;
    }

    // Extract list and meta if data is a result object (e.g., { users, total, page, limit })
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
    const page = Math.max(
      1,
      Number(pageMeta.page ?? pageMeta.currentPage ?? 1)
    );
    const limit = Math.max(
      1,
      Number(pageMeta.limit ?? pageMeta.perPage ?? (list.length || 10))
    );
    const totalPages = Number(
      pageMeta.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 1)
    );
    const hasNextPage = Boolean(
      pageMeta.hasNextPage ?? (page < totalPages)
    );
    const hasPrevPage = Boolean(
      pageMeta.hasPrevPage ?? (page > 1)
    );

    const extra = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      ...extraData,
    };

    return this.success(res, list, extra, successMessage);
  }

  readHTMLFile(path) {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
      if (err) {
        console.log(err);
        return err;
      } else {
        return html;
      }
    });
  }
}

export default BaseController;
