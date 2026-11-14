import { Router, Request as HttpRequest, Response } from "express";
import { Schema, model } from "mongoose";
import { authenticateUser, authorizeRoles } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";
const PageCount = model("PageCount", new Schema({ day: { type: String, required: true }, path: { type: String, required: true }, views: { type: Number, default: 0 } }).index({ day: 1, path: 1 }, { unique: true }));
export const analyticsRouter = Router();
// Aggregate page counts only: no cookies, IP addresses, query strings, or user identities.
analyticsRouter.post("/pageview", asyncHandler(async (req: HttpRequest, res: Response) => {
  const path = req.body.path;
  if (!["/", "/book", "/login", "/register", "/track-request"].includes(path)) { res.status(400).json({ message: "Unsupported page" }); return; }
  const day = new Date().toISOString().slice(0,10);
  await PageCount.updateOne({ day, path }, { $inc: { views: 1 } }, { upsert: true });
  res.status(204).end();
}));
analyticsRouter.get("/", authenticateUser, authorizeRoles("ADMIN"), asyncHandler(async (req: HttpRequest, res: Response) => {
  const days = Math.max(1, Math.min(90, Math.floor(Number(req.query.days)) || 14));
  const start = new Date(); start.setUTCDate(start.getUTCDate() - days + 1);
  const totals = await PageCount.aggregate([{ $match: { day: { $gte: start.toISOString().slice(0,10) } } }, { $group: { _id: "$day", count: { $sum: "$views" } } }, { $sort: { _id: 1 } }]);
  const pages = await PageCount.aggregate([{ $match: { day: { $gte: start.toISOString().slice(0,10) } } }, { $group: { _id: "$path", count: { $sum: "$views" } } }, { $sort: { count: -1 } }]);
  res.json({ data: { total: totals.reduce((sum, d) => sum + d.count, 0), perDay: totals.map(d=>({ date:d._id,count:d.count })), pages } });
}));
