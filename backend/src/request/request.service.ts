import { notificationEvent } from "../notifications/notification.service";
import type { NotificationEvent } from "../types/notification.types";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";
import { Types } from "mongoose";
import Request, { RequestDocument } from "./request.model";
import type { RequestQuery } from "../query/request/requestQuery";

export const createRequestService = async (data: {
  name: string;
  from: string;
  to: string;
  date: Date;
  budget?: number;
  contact: string;
  trackingId: string;
  whatsappOptIn?: boolean;
  notificationEvents?: NotificationEvent[];
  user?: string;
  history?: { status: string; createdAt: Date }[];
}): Promise<RequestDocument> => {
  const request = await Request.create({ ...data, user: data.user ? new Types.ObjectId(data.user) : undefined });
  return request;
};

export const getAllRequestsService = async (
  requestQuery: RequestQuery,
): Promise<RequestDocument[]> => {
  const { filters, pagination, sort } = requestQuery;

  const query: any = {};

  // SEARCH (safe regex version)
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { from: { $regex: filters.search, $options: "i" } },
      { to: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from) {
    query.from = filters.from;
  }

  if (filters.to) {
    query.to = filters.to;
  }

  if (filters.fromDate || filters.toDate) {
    query.date = {};
    if (filters.fromDate) query.date.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.date.$lte = new Date(filters.toDate);
  }

  const allowedSortFields = ["createdAt", "date", "budget"];
  const sortField = allowedSortFields.includes(sort.field)
    ? sort.field
    : "createdAt";

  return Request.find(query)
    .sort({ [sortField]: sort.order })
    .skip(pagination.skip)
    .limit(pagination.limit);
};

export const getRequestByIdService = async (
  id: string,
): Promise<RequestDocument | null> => {
  return Request.findById(id);
};

export const getMyRequestsService = async (
  userId: string,
  requestQuery: RequestQuery,
): Promise<RequestDocument[]> => {
  const { filters, pagination, sort } = requestQuery;

  const query: any = { user: userId };

  // SEARCH (safe regex version)
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { from: { $regex: filters.search, $options: "i" } },
      { to: { $regex: filters.search, $options: "i" } },
      { contact: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters.trackingId) {
    query.trackingId = filters.trackingId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from) {
    query.from = filters.from;
  }

  if (filters.to) {
    query.to = filters.to;
  }

  if (filters.fromDate || filters.toDate) {
    query.date = {};
    if (filters.fromDate) query.date.$gte = new Date(filters.fromDate);
    if (filters.toDate) query.date.$lte = new Date(filters.toDate);
  }

  const allowedSortFields = ["createdAt", "date", "budget"];
  const sortField = allowedSortFields.includes(sort.field)
    ? sort.field
    : "createdAt";

  return Request.find(query)
    .sort({ [sortField]: sort.order })
    .skip(pagination.skip)
    .limit(pagination.limit);
};

export const getRequestByTrackingIdService = async (
  trackingId: string,
): Promise<RequestDocument | null> => {
  return Request.findOne({ trackingId: trackingId.length <= 6 ? { $in: [trackingId, trackingId.toUpperCase(), trackingId.toLowerCase()] } : trackingId });
};

export const claimRequestService = async (
  trackingId: string,
  userId: string,
  contact?: unknown,
) => {
  if (trackingId.length <= 6 && (typeof contact !== "string" || !contact.trim())) CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.MISSING_REQUIRED_FIELD, "Enter the contact used for this request");
  const contactFilter = trackingId.length <= 6 ? { contact: { $regex: `^${(contact as string).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } } : {};
  const request = await Request.findOneAndUpdate(
    { trackingId: trackingId.length <= 6 ? { $in: [trackingId, trackingId.toUpperCase(), trackingId.toLowerCase()] } : trackingId, ...contactFilter, $or: [{ user: { $exists: false } }, { user: null }] },
    { $set: { user: userId, claimedAt: new Date() } },
    { new: true },
  );
  if (!request) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.REQUEST_NOT_FOUND, "Request not found or already claimed");
  return request;
};

export const getRequestStatsService = async (days = 14) => {
  // Total counts
  const total = await Request.countDocuments();

  // Counts by status
  const byStatusAgg = await Request.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const byStatus: Record<string, number> = {};
  byStatusAgg.forEach((s: any) => (byStatus[s._id] = s.count));

  // Claimed vs open (pending with/without user)
  const claimed = await Request.countDocuments({
    status: "pending",
    user: { $exists: true, $ne: null },
  });
  const open = await Request.countDocuments({
    status: "pending",
    $or: [{ user: { $exists: false } }, { user: null }],
  });

  // Recent requests (latest 5)
  const recentRequests = await Request.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("from to name date budget createdAt status user trackingId")
    .lean();

  // Time series for the last `days` days
  const end = new Date();
  const start = new Date();
  days = Math.max(1, Math.min(90, Math.floor(days)));
  start.setUTCDate(end.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const perDayAgg = await Request.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // normalize to full range
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(end.getUTCDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  perDayAgg.forEach((r: any) => map.set(r._id, r.count));

  const perDay = Array.from(map.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    total,
    byStatus,
    claimed,
    open,
    recentRequests,
    perDay,
  };
};

export const updateRequestStatusService = async (
  id: string,
  status: "pending" | "processing" | "completed" | "rejected",
): Promise<RequestDocument | null> => {
  return Request.findByIdAndUpdate(id, { status }, { new: true });
};
export const updateRequestService = async (
  id: string,
  data: Partial<{
    status: "pending" | "processing" | "completed" | "rejected";
    name: string;
    from: string;
    to: string;
    date: Date;
    budget?: number;
    contact: string;
  }>,
): Promise<RequestDocument | null> => {
  const update: Record<string, unknown> = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  if (data.contact !== undefined) update.whatsappOptIn = false;
  const extra = data.status ? { $push: { history: { status: data.status, createdAt: new Date() }, notificationEvents: notificationEvent("status.updated") } } : {};
  return Request.findByIdAndUpdate(id, { $set: update, ...extra }, { new: true, runValidators: true });
};

export const deleteRequestService = async (
  id: string,
): Promise<RequestDocument | null> => {
  return Request.findByIdAndDelete(id);
};
