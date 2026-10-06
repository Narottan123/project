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
  // successWithPagination(res, data) {
  //   if (!Array.isArray(data)) {
  //     return this.error(res, { message: "Data should be an array" });
  //   }


  //   let responseData = data;

  //   let count = 0;
  //   let page = 0;
  //   let limit = 0;
  //   if (Object.keys(responseData.totalCount).length > 0) {
  //     count = responseData.totalCount[0].count;
  //     page = parseInt(responseData.totalCount[0].page);
  //     limit =
  //       parseInt(responseData.totalCount[0].limit) > 0
  //         ? parseInt(responseData.totalCount[0].limit)
  //         : Configuration.limit;
  //   }
  //   let extra = {
  //     count: count,
  //     limit: limit > 0 ? limit : Configuration.limit,
  //     totalPages: Math.ceil(count / limit),
  //     page: page,
  //   };
  //   if (responseData.totalCount[0]?.alias_name) {
  //     extra.alias_name = responseData.totalCount[0].alias_name;
  //   }

  //   if (responseData.totalCount[0]?.name) {
  //     extra.name = responseData.totalCount[0].name;
  //   }
  //   if (responseData.totalCount[0]?.deal_status) {
  //     extra.deal_status = responseData.totalCount[0].deal_status;
  //   }
  //   return this.success(res, responseData, extra);
  // }

  successWithPagination(res, data) {
  if (!Array.isArray(data)) {
    return this.error(res, { message: "Data should be an array" });
  }

  let responseData = data;

  let count = 0;
  let page = 0;
  let limit = 0;
  
  if (responseData.totalCount && Object.keys(responseData.totalCount).length > 0) {
    count = responseData.totalCount[0].count;
    page = parseInt(responseData.totalCount[0].page);
    limit =
      parseInt(responseData.totalCount[0].limit) > 0
        ? parseInt(responseData.totalCount[0].limit)
        : Configuration.limit;
  }

  let extra = {
    count: count,
    limit: limit > 0 ? limit : Configuration.limit,
    totalPages: Math.ceil(count / limit),
    page: page,
  };

  // --- Dynamic Dashboard Meta Property Extraction Block ---
  if (responseData.totalCount && responseData.totalCount[0]) {
    const targetMeta = responseData.totalCount[0];

    if (targetMeta.alias_name) {
      extra.alias_name = targetMeta.alias_name;
    }
    if (targetMeta.name) {
      extra.name = targetMeta.name;
    }
    if (targetMeta.deal_status) {
      extra.deal_status = targetMeta.deal_status;
    }
    
    // Natively extract progress tracking dashboard metrics safely
    if (targetMeta.title) {
      extra.title = targetMeta.title;
    }
    if (targetMeta.summary_cards) {
      extra.summary_cards = targetMeta.summary_cards;
    }
    if (targetMeta.recent_activities) {
      extra.recent_activities = targetMeta.recent_activities;
    }
  }

  return this.success(res, responseData, extra);
}

  successWithPagination1(res, data) {
    if (!Array.isArray(data)) {
      return this.error(res, { message: "Data should be an array" });
    }


    let responseData = data;
    let count = 0;
    let page = 0;
    let limit = 0;
    let ownFolders = 0;
    let ownFiles = 0;
    let sharedFolders = 0;
    if (Object.keys(responseData.totalCount).length > 0) {
      count = responseData.totalCount[0].count;
      page = parseInt(responseData.totalCount[0].page);
      limit =
        parseInt(responseData.totalCount[0].limit) > 0
          ? parseInt(responseData.totalCount[0].limit)
          : Configuration.limit;
      ownFolders = responseData.totalCount[0].ownFolders || 0;
      ownFiles = responseData.totalCount[0].ownFiles || 0;
      sharedFolders = responseData.totalCount[0].sharedFolders || 0;
    }
    let extra = {
      count: count,
      ownFolders: ownFolders, //  added
      ownFiles: ownFiles, //  added
      sharedFolders: sharedFolders,
      limit: limit > 0 ? limit : Configuration.limit,
      totalPages: Math.ceil(count / limit),
      page: page,
      price: responseData.price,
    };

    return this.success(res, responseData, extra);
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
