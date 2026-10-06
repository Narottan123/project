import request from "supertest";
import app from "../src/app.js";

describe("Blog System Auth & OAuth Redirection", () => {
  it("GET /api/v1/auth/google should return 302 redirecting to accounts.google.com", async () => {
    const res = await request(app).get("/api/v1/auth/google");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://accounts.google.com/o/oauth2/v2/auth");
  });

  it("GET /api/v1/auth/facebook should return 302 redirecting to facebook.com", async () => {
    const res = await request(app).get("/api/v1/auth/facebook");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("https://www.facebook.com/v12.0/dialog/oauth");
  });
});
