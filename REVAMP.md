# Flyeasy concierge experience

The platform handles flight **requests**, with the owner completing the actual booking. A quote acceptance never marks a request booked automatically.

## Workspaces

- `/my`: traveler journal with journey filters and quote-review prompts; `/my/new`: the authenticated, account-prefilled three-step flight planner. `/book` redirects signed-in travelers to `/my/new`, preserving trip query parameters. Customer overview and latest 100 requests. Open a request to view its history, exchange messages, and accept or decline a quote. Authenticated submissions are linked to the current account automatically. Guest submissions can be linked using their private tracking reference.
- `/admin`: all-time request/account metrics, daily request graphs, status distribution, recent requests, and aggregate public page activity for 7/14/30 days.
- `/requests`: admin request queue with server-side search, status filters, and pagination.
- `/workspace/:id`: server-authorized request workspace. Customers can access only requests belonging to them; admins can access all requests, update status, and propose quotes.
- `/admin/flights`: admin-only Amadeus offer search, sorted by price. Access it from a request to share a production flight offer as a quote.

## Flight search setup

Set these backend environment variables (never frontend variables):

```
AMADEUS_CLIENT_ID=your-key
AMADEUS_CLIENT_SECRET=your-secret
AMADEUS_ENV=test
```

Test mode uses `test.api.amadeus.com` and displays a test-data label. Test offers cannot be shared as customer quotes. Switch to `AMADEUS_ENV=production` with approved production credentials to use live offers. The current search supports one-way, one adult, economy, and NGN. Admins type city or airport names and select suggestions; airport codes are resolved internally. Popular airports are bundled for instant suggestions; configured Amadeus credentials enable worldwide lookup. Cities with multiple airports show separate choices. Empty or failed searches do not generate mock offers. Airline coverage and inventory depend on the provider; results are the lowest returned prices, not a promise of the cheapest fare everywhere. Fares must be reconfirmed before booking. Ticket issuance and payment remain manual.

API reference: https://github.com/amadeus4dev/amadeus-open-api-specification/blob/main/spec/yaml/FlightOffersSearch_v2_swagger_specification.yaml

## Data and compatibility

Mongoose adds messages, status history, and quote fields without a destructive migration. Older requests without a history display their current status. Existing short tracking references remain valid; newly created references are six unambiguous uppercase letters/digits, backed by a unique database index and collision retries. New short references require the original contact for public tracking and account linking, with a 30-attempt/15-minute per-process IP limit. Legacy short references also require contact; legacy long links stay valid. References and contacts should be kept private. In a multi-instance deployment, replace the process-local limiter with a shared store or gateway rule. Public tracking returns only route, travel date, status, reference, and history; conversations, names, contacts, and quotes require an authenticated workspace.

Public page-view counts begin with this release. Counts are stored by UTC date and allowlisted page path, without user IDs, IP addresses, or query strings. Counts include repeat views and may include bots; these are not unique-visitor statistics. External payments mean no revenue analytics. Flight/account metrics remain real database metrics.

## Design

Preserves `#1e4e8c` blue and `#f7931e` orange. Uses an edge-to-edge fading photographic hero, oversized editorial type, staggered destination imagery, shared responsive workspace shell, accessible focus states, and reduced-motion support. Motion includes a parallax hero, animated flight path, scrolling destination ribbon, scroll reveals, image hover effects, and animated chart paths. Travel photography is delivered from Unsplash; Manrope and Cormorant Garamond are delivered from Google Fonts, with system fallbacks.

Design references: https://www.blacktomato.com/ and https://www.nicer.travel/ for an editorial travel/concierge direction, alongside https://www.skyscanner.net/flights for structured trip information.

## Validation

```
npm run build --prefix frontend
npm run build --prefix backend
npm test --prefix backend -- --silent
```

Browser QA checked the homepage, mobile planner, city/airport selection, account-prefilled review, analytics filters, and customer workspace. Dashboard visuals were checked with an isolated, explicitly labeled fixture harness that was removed afterward; no live accounts or records were changed.

Workflow tests exercise six-character generation/collision retries, contact-verified tracking/claiming, provider-mocked airport-name lookup, server-side admin restrictions, ownership-scoped workspace access, message/quote validation, atomic quote decisions, flight-search authorization/setup errors, invalid trip submission, and public tracking privacy. Database writes and the external flight provider still require an integration check against configured services. Jest excludes stale compiled tests in `dist`.

## Contact, authentication, and notifications

Budget is no longer collected or displayed in the customer request workflow. Contact Us connects directly to the supplied owner email and WhatsApp number. Sign-in and sign-up share a new responsive photographic layout. The inbox, preferences, delivery queue, and provider setup are documented in [NOTIFICATIONS.md](NOTIFICATIONS.md).
