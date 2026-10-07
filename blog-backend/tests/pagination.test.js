import { jest } from "@jest/globals";
import BaseController from "../src/http/controllers/baseController.js";
import { successWithPagination } from "../src/http/utils/helper.js";

describe("Reusable successWithPagination", () => {
  const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test("BaseController.successWithPagination formats paginated response correctly", () => {
    const controller = new BaseController();
    const mockRes = createMockRes();

    const items = [{ id: 1 }, { id: 2 }];
    const pagination = {
      total: 25,
      page: 2,
      limit: 10,
    };

    controller.successWithPagination(mockRes, items, pagination, "Items list");

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const jsonCall = mockRes.json.mock.calls[0][0];

    expect(jsonCall.success).toBe(true);
    expect(jsonCall.message).toBe("Items list");
    expect(jsonCall.data).toEqual(items);
    expect(jsonCall.extra).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  test("BaseController.successWithPagination automatically extracts array from result object", () => {
    const controller = new BaseController();
    const mockRes = createMockRes();

    const result = {
      users: [{ id: 1, name: "Alice" }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    controller.successWithPagination(mockRes, result, "Users retrieved");

    const jsonCall = mockRes.json.mock.calls[0][0];
    expect(jsonCall.data).toEqual([{ id: 1, name: "Alice" }]);
    expect(jsonCall.extra.total).toBe(1);
    expect(jsonCall.extra.page).toBe(1);
    expect(jsonCall.extra.totalPages).toBe(1);
    expect(jsonCall.extra.hasNextPage).toBe(false);
    expect(jsonCall.extra.hasPrevPage).toBe(false);
  });

  test("Standalone helper successWithPagination works identically", () => {
    const mockRes = createMockRes();
    const posts = [{ id: 101, title: "Hello World" }];

    successWithPagination(mockRes, posts, { total: 100, page: 1, limit: 10 }, "Posts list");

    const jsonCall = mockRes.json.mock.calls[0][0];
    expect(jsonCall.success).toBe(true);
    expect(jsonCall.data).toEqual(posts);
    expect(jsonCall.extra.totalPages).toBe(10);
    expect(jsonCall.extra.hasNextPage).toBe(true);
    expect(jsonCall.extra.hasPrevPage).toBe(false);
  });
});
