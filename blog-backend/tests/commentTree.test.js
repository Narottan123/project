import commentService from "../src/http/services/commentService.js";

describe("Dynamic Comment Hierarchy & Tree Building", () => {
  test("builds nested reply tree correctly", () => {
    const rawComments = [
      {
        _id: "c1",
        content: "Top level comment 1",
        parentId: null,
        createdAt: new Date("2026-10-07T10:00:00Z"),
      },
      {
        _id: "c2",
        content: "Top level comment 2",
        parentId: null,
        createdAt: new Date("2026-10-07T11:00:00Z"),
      },
      {
        _id: "r1",
        content: "Reply to c1",
        parentId: "c1",
        createdAt: new Date("2026-10-07T10:15:00Z"),
      },
      {
        _id: "r2",
        content: "Nested reply to r1",
        parentId: "r1",
        createdAt: new Date("2026-10-07T10:30:00Z"),
      },
      {
        _id: "r3",
        content: "Reply to c2",
        parentId: "c2",
        createdAt: new Date("2026-10-07T11:10:00Z"),
      },
    ];

    const tree = commentService.buildCommentTree(rawComments);

    // Should have 2 top level comments
    expect(tree.length).toBe(2);

    // c2 should come first (newest top level first: 11:00 > 10:00)
    expect(tree[0]._id).toBe("c2");
    expect(tree[0].replies.length).toBe(1);
    expect(tree[0].replies[0]._id).toBe("r3");

    // c1 is second top level
    expect(tree[1]._id).toBe("c1");
    expect(tree[1].replies.length).toBe(1);
    expect(tree[1].replies[0]._id).toBe("r1");

    // r1 has nested reply r2
    expect(tree[1].replies[0].replies.length).toBe(1);
    expect(tree[1].replies[0].replies[0]._id).toBe("r2");
    expect(tree[1].replies[0].replies[0].replies.length).toBe(0);
  });

  test("handles empty comments array safely", () => {
    const tree = commentService.buildCommentTree([]);
    expect(tree).toEqual([]);
  });
});
