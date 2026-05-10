import { Request } from "express";

export type RequestQuery = {
  filters: {
    search?: string;
    status?: "pending" | "processing" | "completed" | "rejected";
    from?: string;
    to?: string;
    fromDate?: string;
    toDate?: string;
    trackingId?: string;
  };

  pagination: {
    page: number;
    limit: number;
    skip: number;
  };

  sort: {
    field: "createdAt" | "date" | "budget";
    order: 1 | -1;
  };
};

export const parseRequestQuery = (req: Request): RequestQuery => {
  const {
    search,
    status,
    from,
    to,
    trackingId,
    sort,
    page = "1",
    limit = "10",
  } = req.query;

  let sortField: "createdAt" | "date" | "budget" = "createdAt";
  let sortOrder: 1 | -1 = -1;

  const allowedSortFields = ["createdAt", "date", "budget"];

  if (typeof sort === "string") {
    if (sort.startsWith("-")) {
      const field = sort.slice(1);
      if (allowedSortFields.includes(field)) {
        sortField = field as any;
        sortOrder = -1;
      }
    } else {
      if (allowedSortFields.includes(sort)) {
        sortField = sort as any;
        sortOrder = 1;
      }
    }
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  return {
    filters: {
      search: typeof search === "string" ? search.trim() : undefined,
      status: typeof status === "string" ? status as any : undefined,
      from: typeof from === "string" ? from : undefined,
      to: typeof to === "string" ? to : undefined,
      trackingId: typeof trackingId === "string" ? trackingId : undefined,
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      skip: (pageNum - 1) * limitNum,
    },
    sort: {
      field: sortField,
      order: sortOrder,
    },
  };
};