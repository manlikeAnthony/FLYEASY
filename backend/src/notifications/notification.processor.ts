import { isEmail } from "../utils/email/isEmail";
import Notification from "./notification.model";
import Preference from "./notificationPreference.model";
import Request from "../request/request.model";
import User from "../auth/user.model";
import { getOwnerContactService } from "../contact/contact.service";
import { getNotificationChannelStatusService } from "./notification.service";
import {
  sendNotificationEmail,
  sendNotificationWhatsApp,
} from "./notification.delivery";
import type { NotificationKind } from "../types/notification.types";

const copy: Record<NotificationKind, { title: string; body: string }> = {
  "request.created": {
    title: "A new journey needs your attention",
    body: "A traveler has requested a flight. Open the booking desk to review their plans.",
  },
  "quote.sent": {
    title: "Your flight quote is ready",
    body: "Your travel expert has shared a flight proposal. Review the details and let them know what works.",
  },
  "quote.accepted": {
    title: "A traveler accepted your quote",
    body: "Your traveler has approved the proposal. Their journey is ready for your next step.",
  },
  "quote.declined": {
    title: "A traveler would like another option",
    body: "Your traveler declined the proposal. Open the conversation to find a better fit.",
  },
  "message.received": {
    title: "A new message in your journey",
    body: "There’s an update waiting in your request conversation.",
  },
  "status.updated": {
    title: "Your journey has an update",
    body: "Your travel expert updated your request’s progress. Open your journey for the latest.",
  },
};

// Events are embedded in the same atomic request write as the action they describe.
// Publishing is idempotent, so a restart cannot silently lose a quote alert.
export const publishNotificationEvents = async () => {
  const requests = await Request.find({
    notificationEvents: { $elemMatch: { publishedAt: null } },
  })
    .limit(25)
    .lean();
  for (const request of requests) {
    for (const event of request.notificationEvents.filter(
      (e) => !e.publishedAt,
    )) {
      const forAdmins =
        ["request.created", "quote.accepted", "quote.declined"].includes(
          event.kind,
        ) ||
        (event.kind === "message.received" && event.actorRole !== "ADMIN");
      const recipients: { id?: string; email: string; guest?: boolean }[] = [];
      if (forAdmins) {
        const admins = await User.find({ role: "ADMIN" })
          .select("_id email")
          .lean();
        admins.forEach((admin) =>
          recipients.push({ id: String(admin._id), email: admin.email }),
        );
        const owner = await getOwnerContactService();
        const email = process.env.OWNER_ALERT_EMAIL || owner.email;
        if (
          isEmail(email) &&
          !recipients.some((r) => r.email.toLowerCase() === email.toLowerCase())
        )
          recipients.push({ email });
      } else if (request.user) {
        const customer = await User.findById(request.user)
          .select("_id email")
          .lean();
        if (customer)
          recipients.push({ id: String(customer._id), email: customer.email });
      } else {
        recipients.push({
          email: isEmail(request.contact) ? request.contact : "",
          guest: true,
        });
      }
      for (const recipient of recipients) {
        if (recipient.id && recipient.id === event.actorId) continue;
        const preferences = recipient.id
          ? await Preference.findOne({ user: recipient.id }).lean()
          : null;
        const emailEnabled = preferences?.emailEnabled ?? true;
        let whatsapp = "";
        if (
          recipient.guest &&
          request.whatsappOptIn &&
          /^\+[1-9]\d{7,14}$/.test(request.contact.trim())
        )
          whatsapp = request.contact.trim();
        else if (
          recipient.id &&
          preferences?.whatsappEnabled &&
          preferences.whatsappConsentAt
        )
          whatsapp = preferences.whatsappNumber;
        const text = copy[event.kind];
        if (!text) continue;
        const recipientKey =
          recipient.id || recipient.email || `guest:${request._id}`;
        await Notification.updateOne(
          { eventId: event.eventId, recipientKey },
          {
            $setOnInsert: {
              eventId: event.eventId,
              recipientKey,
              recipient: recipient.id,
              request: request._id,
              kind: event.kind,
              title: text.title,
              body: text.body,
              href: recipient.id
                ? `/workspace/${request._id}`
                : forAdmins
                  ? "/admin"
                  : `/track-request/${request.trackingId}`,
              email: {
                to: emailEnabled ? recipient.email : "",
                status:
                  emailEnabled && recipient.email ? "pending" : "disabled",
                attempts: 0,
                nextAttemptAt: new Date(),
              },
              whatsapp: {
                to: whatsapp || "",
                status: whatsapp ? "pending" : "disabled",
                attempts: 0,
                nextAttemptAt: new Date(),
              },
            },
          },
          { upsert: true },
        );
      }
      await Request.updateOne(
        { _id: request._id, "notificationEvents.eventId": event.eventId },
        { $set: { "notificationEvents.$.publishedAt": new Date() } },
      );
    }
  }
};

export const deliverPendingNotifications = async () => {
  const configured = getNotificationChannelStatusService();
  for (const channel of ["email", "whatsapp"] as const) {
    if (
      !(channel === "email"
        ? configured.emailConfigured
        : configured.whatsappConfigured)
    )
      continue;
    for (let i = 0; i < 10; i++) {
      const now = new Date();
      const notification = await Notification.findOneAndUpdate(
        {
          $or: [
            {
              [`${channel}.status`]: "pending",
              [`${channel}.nextAttemptAt`]: { $lte: now },
            },
            {
              [`${channel}.status`]: "processing",
              [`${channel}.lockedUntil`]: { $lt: now },
            },
          ],
        },
        {
          $set: {
            [`${channel}.status`]: "processing",
            [`${channel}.lockedUntil`]: new Date(Date.now() + 120000),
          },
          $inc: { [`${channel}.attempts`]: 1 },
        },
        { new: true },
      ).select("+email.to +whatsapp.to");
      if (!notification) break;
      try {
        if (notification.recipient) {
          const preferences = await Preference.findOne({
            user: notification.recipient,
          }).lean();
          if (
            (channel === "email" && preferences?.emailEnabled === false) ||
            (channel === "whatsapp" &&
              (!preferences?.whatsappEnabled ||
                !preferences.whatsappConsentAt ||
                preferences.whatsappNumber !== notification.whatsapp.to))
          ) {
            await Notification.updateOne(
              { _id: notification._id },
              {
                $set: {
                  [`${channel}.status`]: "disabled",
                  [`${channel}.lockedUntil`]: null,
                },
              },
            );
            continue;
          }
        }
        if (channel === "whatsapp" && !notification.recipient) {
          const request = await Request.findById(notification.request)
            .select("whatsappOptIn contact")
            .lean();
          if (
            !request?.whatsappOptIn ||
            request.contact.trim() !== notification.whatsapp.to
          ) {
            await Notification.updateOne(
              { _id: notification._id },
              {
                $set: {
                  "whatsapp.status": "disabled",
                  "whatsapp.lockedUntil": null,
                },
              },
            );
            continue;
          }
        }
        const providerId =
          channel === "email"
            ? await sendNotificationEmail(
                notification.email.to,
                notification.title,
                notification.body,
                notification.href,
              )
            : await sendNotificationWhatsApp(
                notification.whatsapp.to,
                notification.title,
                notification.href,
              );
        await Notification.updateOne(
          { _id: notification._id },
          {
            $set: {
              [`${channel}.status`]: "submitted",
              [`${channel}.providerId`]: providerId,
              [`${channel}.lockedUntil`]: null,
            },
          },
        );
      } catch {
        // Do not persist provider responses: they can contain credentials or contact details.
        await Notification.updateOne(
          { _id: notification._id },
          {
            $set: {
              [`${channel}.status`]:
                notification[channel].attempts >= 5 ? "failed" : "pending",
              [`${channel}.nextAttemptAt`]: new Date(
                Date.now() +
                  Math.min(
                    3600000,
                    30000 * 2 ** notification[channel].attempts,
                  ),
              ),
              [`${channel}.lockedUntil`]: null,
            },
          },
        );
      }
    }
  }
};

let deliveryInProgress = false;

// Low-traffic mode: publishing happens synchronously as part of the request
// that created the event. Delivery is then attempted in that same API process,
// without a timer, queue process, or separately deployed worker. Pending work
// is tried again by later notification-producing requests and inbox reads.
export const processNotificationOutbox = async () => {
  try {
    await publishNotificationEvents();
  } catch {
    // The request already wrote a durable event. A later request can retry it.
    return;
  }
  if (deliveryInProgress) return;
  deliveryInProgress = true;
  void deliverPendingNotifications()
    .catch(() => {
      // Delivery failures are persisted with retry timing by the processor.
    })
    .finally(() => {
      deliveryInProgress = false;
    });
};
