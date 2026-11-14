import request from "supertest";
import app from "../src/app";

describe("FlyEasy API", () => {
  describe("GET /", () => {
    it("should return API health information", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        message: "FlyEasy API is running",
      });
    });
  });

  describe("404 handling", () => {
    it("should return 404 for an unknown route", async () => {
      const response = await request(app).get("/api/v1/does-not-exist");

      expect(response.status).toBe(404);
    });
  });

  describe("CORS", () => {
    it("should allow the frontend origin", async () => {
      const response = await request(app)
        .get("/")
        .set("Origin", "http://localhost:5173");

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5173",
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });
  });
});
