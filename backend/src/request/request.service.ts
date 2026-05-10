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
}): Promise<RequestDocument> => {
  const request = await Request.create(data);
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
  return Request.findOne({ trackingId });
};

export const claimRequestService = async (
  trackingId: string,
  userId: string,
) => {
  const request = await Request.findOne({ trackingId });

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.user) {
    throw new Error("Already claimed");
  }

  request.user = userId as any; // Type assertion since we know it's an ObjectId
  request.claimedAt = new Date();

  return request.save();
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
    .select("routeFrom routeTo createdAt status user trackingId")
    .lean();

  // Time series for the last `days` days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

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
    d.setDate(end.getDate() - i);
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
    name: string;
    from: string;
    to: string;
    date: Date;
    budget?: number;
    contact: string;
  }>,
): Promise<RequestDocument | null> => {
  return Request.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRequestService = async (
  id: string,
): Promise<RequestDocument | null> => {
  return Request.findByIdAndDelete(id);
};
