# Contact and notification setup

## Public contact

Contact Us links directly to **daniellaonyejesi@gmail.com** and **+2347041176870**. These are the owner-supplied business defaults, not example addresses. Email opens the visitor's email client; WhatsApp opens a conversation with the owner. Nothing is sent until the visitor chooses to send it.

Admins can update the public details in **Notifications → Preferences → Your public contact details**. Values are stored in the `Contact` collection. Optional deployment overrides are `OWNER_CONTACT_EMAIL` and `OWNER_WHATSAPP_NUMBER`. A separate `OWNER_ALERT_EMAIL` can override the owner's operational email destination without changing public contact details.

## Events and recipients

| Event | Recipient |
| --- | --- |
| New flight request | Admin accounts and the configured owner email |
| Quote sent | Request owner, or the guest contact |
| Quote accepted or declined | Admin accounts and the configured owner email |
| Traveler message | Admin accounts and owner email |
| Admin message | Request owner or guest contact |
| Request status changed | Request owner or guest contact |

Self-notifications are skipped. Account notifications are private to the authenticated recipient. Guest contacts receive email when an email was supplied, or WhatsApp only when a valid international phone number and explicit opt-in were supplied. Claiming a request does not backfill earlier guest inbox entries.

## Database and backend layout

New modules follow the existing model/service/controller/route pattern:

- `src/notifications/notification.model.ts`: inbox entries, read state, email/WhatsApp queue status and attempts.
- `src/notifications/notificationPreference.model.ts`: per-account channel choices and WhatsApp consent.
- `src/notifications/notification.service.ts`, `.controller.ts`, `.route.ts`: authenticated inbox, mark-read, preferences, and admin channel configuration status.
- `src/notifications/notification.delivery.ts`: existing Brevo mail helper or Gmail SMTP, plus Twilio WhatsApp.
- `src/notifications/notification.processor.ts`: request-driven durable event publication, delivery attempts, retries, and channel leases.
- `src/contact/contact.model.ts`, `.service.ts`, `.controller.ts`, `.route.ts`: public owner contact and admin-only updates.
- `src/request/requestWorkflow.service.ts`, `.controller.ts`, `.route.ts`: workspace, conversation, quote and flight-finder logic, extracted from the previous inline router.
- `src/types/notification.types.ts`: shared event and delivery types.

Request changes and an embedded `notificationEvents` outbox event are written atomically to the same request document. The same API request projects unpublished events into `Notification` records, then makes a best-effort delivery attempt in-process. There is no timer, queue process, worker server, or second deployment to run. A later request creation, quote/message action, or notification-inbox read retries any still-pending work. A unique `(eventId, recipientKey)` index makes publication idempotent. Keep this index enabled in production. Individual channel claims use leases to avoid simultaneous processing by multiple API instances.

Provider failures do not fail the originating flight request or quote. Delivery retries back off, stopping after five attempts; failed records remain stored for inspection. Missing provider setup leaves messages pending until configured. Provider acceptance is recorded as **submitted**, not confirmed delivery. A process crash after provider acceptance but before database acknowledgment can cause a repeated external message: delivery is at least once, not exactly once. Final delivery receipts and automatic retries of permanently failed entries are not implemented.

The notification processor is invoked by request actions and inbox reads; `src/server.ts` starts only the API. Existing requests without outbox events are unaffected. Legacy budget data is retained, but new flight submissions ignore budget and the customer UI no longer collects or displays it.

## Email, including Gmail recipients

The existing Brevo setup is reused when `BREVO_API_KEY` and `EMAIL_USER` are configured. Otherwise, Gmail SMTP is supported through the existing Nodemailer transport:

```text
EMAIL_USER=<verified sender email>
EMAIL_PASS=<Gmail app password>
FRONTEND_URL=https://<your-frontend-domain>
```

`EMAIL_USER` is the sending identity; it does not need to equal the owner's Gmail address. Brevo requires a verified sender. For Gmail SMTP, use an app password for an account that supports it. Account email alerts are enabled by default and can be disabled in Notifications → Preferences. These preferences do not suppress security verification/password-reset emails.

## WhatsApp automated alerts

Direct WhatsApp contact links work without API credentials. Automated outbound alerts require a WhatsApp Business sender and an approved utility template through Twilio:

```text
TWILIO_ACCOUNT_SID=<account SID>
TWILIO_AUTH_TOKEN=<auth token>
TWILIO_WHATSAPP_FROM=whatsapp:+<approved sender number>
TWILIO_WHATSAPP_CONTENT_SID=<approved content template SID>
FRONTEND_URL=https://<your-frontend-domain>
```

The approved template must accept variable `1` for the short update title and variable `2` for the complete HTTPS journey URL. The owner’s public WhatsApp number is the chat destination; it is not automatically an approved sending identity. Store provider credentials only in the backend environment.

Account holders, including admins, explicitly enable WhatsApp, supply an international number and confirm consent in Notifications → Preferences. Guests can opt in while providing a phone contact, and stop updates from their contact-verified tracking page. The processor rechecks opt-outs before attempting pending deliveries.

Twilio reference: https://www.twilio.com/docs/whatsapp/api

## Frontend behavior and verification

Notifications → Inbox supports unread badges, mark-read/mark-all, pagination, journey links and channel submission state. The bell polls every 15 seconds while the page is active and shows an in-app toast for new entries. Background polling is disabled; opening/focusing the app refreshes the inbox. This is in-app alerting, not OS push notification delivery.

Sign-in/sign-up now share a full-height photographic layout, accessible underlined fields, password visibility controls, browser autofill, and the existing email-verification flow. Layout references: https://resend.com/login and https://resend.com/signup, adapted to Flyeasy's travel identity; no unsupported social-login buttons were added.

Tests mock all external delivery. They cover ownership, opt-in requirements, atomic quote events, publication failure recovery, channel submission/retry/opt-out behavior and direct owner contact defaults. Live provider credentials, approved WhatsApp template delivery and production MongoDB behavior still require an integration check. No real notifications or registration emails were sent during implementation.

## Authentication deployment

Login now uses a secure HTTP-only cookie where the browser permits it and a short-lived Bearer access-token fallback for mobile browsers that block a cross-site API cookie. This prevents a Safari/Chrome third-party-cookie policy from immediately turning a successful login into “Authentication required.” The token is sent only to the configured API origin over HTTPS; it is not included in request URLs.

Set `FRONTEND_URL` to the exact deployed frontend origin. Multiple frontend origins can be supplied as a comma-separated list, and `FRONTEND_URL_PROD` is also accepted. For a cross-site frontend/API deployment, use HTTPS plus `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`. For a frontend and API hosted on the same site, keep the safer `COOKIE_SAME_SITE=lax` default. Optionally set `COOKIE_DOMAIN` only when deliberately sharing cookies across trusted subdomains.

Each successful sign-in now creates its own refresh-session record. Logging out removes only the refresh record for that browser, not all records belonging to the account, so signing out on one phone or computer does not sign out the others.
