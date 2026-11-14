export type NotificationKind = "request.created" | "quote.sent" | "quote.accepted" | "quote.declined" | "message.received" | "status.updated";
export type NotificationEvent = {
  eventId: string;
  kind: NotificationKind;
  actorId?: string;
  actorRole?: string;
  createdAt: Date;
  publishedAt?: Date | null;
};
export type DeliveryStatus = "pending" | "processing" | "submitted" | "failed" | "disabled";
