import { isValidObjectId } from "mongoose";
import Request from "./request.model";
import { amadeusBase, amadeusToken } from "./amadeus";
import { notificationEvent } from "../notifications/notification.service";
import { CustomError } from "../errors/CustomError";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";
import type { TokenUser } from "../types/token";

export const getRequestWorkspaceService = async (id: string, user: TokenUser) => {
  if (!isValidObjectId(id)) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.REQUEST_NOT_FOUND, "Request not found");
  const request = await Request.findOne(user.role === "ADMIN" ? { _id: id } : { _id: id, user: user.userId });
  if (!request) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.REQUEST_NOT_FOUND, "Request not found");
  return request;
};

export const addRequestMessageService = async (id: string, user: TokenUser, text: unknown) => {
  if (typeof text !== "string" || !text.trim() || text.length > 2000) CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Write a message between 1 and 2,000 characters.");
  const request = await getRequestWorkspaceService(id, user);
  await Request.updateOne({ _id: request._id }, { $push: {
    messages: { author: user.userId, role: user.role, text: text.trim(), createdAt: new Date() },
    notificationEvents: notificationEvent("message.received", user.userId, user.role),
  } });
};

export const sendRequestQuoteService = async (id: string, user: TokenUser, input: Record<string, unknown>) => {
  const { airline, amount, details, currency = "NGN" } = input;
  if (typeof airline !== "string" || !airline.trim() || airline.length > 120 || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || typeof currency !== "string" || !["NGN", "USD", "EUR", "GBP"].includes(currency) || typeof details !== "string" || !details.trim() || details.length > 2000) {
    CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Provide an airline, positive amount, currency, and itinerary details.");
  }
  await getRequestWorkspaceService(id, user);
  const request = await Request.findOneAndUpdate({ _id: id, status: { $nin: ["completed", "rejected"] } }, { $set: {
    quote: { airline: airline.trim(), amount, currency, details: details.trim(), decision: "pending" }, status: "processing",
  }, $push: {
    history: { status: "processing", createdAt: new Date() },
    notificationEvents: notificationEvent("quote.sent", user.userId, user.role),
  } }, { new: true, runValidators: true });
  if (!request) CustomError.throwError(HttpCodes.CONFLICT, AppCodes.INVALID_INPUT, "Reopen this request before sending a quote.");
};

export const decideRequestQuoteService = async (id: string, user: TokenUser, decision: unknown) => {
  if (decision !== "accepted" && decision !== "declined") CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Choose accept or decline.");
  if (!isValidObjectId(id)) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.REQUEST_NOT_FOUND, "Request not found");
  const request = await Request.findOneAndUpdate({ _id: id, user: user.userId, status: "processing", "quote.decision": "pending" }, {
    $set: { "quote.decision": decision },
    $push: {
      messages: { author: user.userId, role: user.role, text: `Quote ${decision} by customer.`, createdAt: new Date() },
      notificationEvents: notificationEvent(decision === "accepted" ? "quote.accepted" : "quote.declined", user.userId, user.role),
    },
  }, { new: true });
  if (!request) CustomError.throwError(HttpCodes.CONFLICT, AppCodes.RESOURCE_NOT_FOUND, "This quote is unavailable or has already been answered.");
  return request;
};

export const searchFlightOffersService = async (input: Record<string, unknown>) => {
  const origin = String(input.origin || "").toUpperCase();
  const destination = String(input.destination || "").toUpperCase();
  const date = String(input.date || "");
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || date < new Date().toISOString().slice(0, 10)) {
    CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Choose departure and destination airports and a future date.");
  }
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) CustomError.throwError(HttpCodes.SERVICE_UNAVAILABLE, AppCodes.EXTERNAL_SERVICE_FAILURE, "Flight search needs Amadeus credentials on the server.");
  try {
    const token = await amadeusToken();
    const params = new URLSearchParams({ originLocationCode: origin, destinationLocationCode: destination, departureDate: date, adults: "1", currencyCode: "NGN", max: "20" });
    const response = await fetch(`${amadeusBase()}/v2/shopping/flight-offers?${params}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("Provider search failed");
    const payload = await response.json() as { data: { id: string; price: { grandTotal: string; currency: string }; validatingAirlineCodes: string[]; itineraries: { duration: string; segments: { departure: { iataCode: string; at: string }; arrival: { iataCode: string; at: string }; carrierCode: string; number: string }[] }[] }[] };
    const offers = payload.data.map(offer => ({ id: offer.id, amount: Number(offer.price.grandTotal), currency: offer.price.currency, airline: offer.validatingAirlineCodes.join(", "), itineraries: offer.itineraries })).sort((a, b) => a.amount - b.amount);
    return { offers, environment: process.env.AMADEUS_ENV === "production" ? "production" : "test" };
  } catch { CustomError.throwError(HttpCodes.BAD_GATEWAY, AppCodes.EXTERNAL_SERVICE_FAILURE, "Flight provider is unavailable. Check credentials and try again shortly."); }
};

export const searchAirportsService = async (keyword: string) => {
  if (keyword.length < 2 || keyword.length > 100) CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Enter at least two characters.");
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) CustomError.throwError(HttpCodes.SERVICE_UNAVAILABLE, AppCodes.EXTERNAL_SERVICE_FAILURE, "Worldwide airport lookup is not configured. Popular airports are available locally.");
  try {
    const token = await amadeusToken();
    const query = new URLSearchParams({ subType: "AIRPORT", keyword, "page[limit]": "10" });
    const response = await fetch(`${amadeusBase()}/v1/reference-data/locations?${query}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Airport lookup failed");
    const payload = await response.json() as { data: { iataCode: string; name: string; address: { cityName: string; countryName: string } }[] };
    return payload.data.map(a => ({ code: a.iataCode, city: a.address.cityName, name: a.name, country: a.address.countryName }));
  } catch { CustomError.throwError(HttpCodes.BAD_GATEWAY, AppCodes.EXTERNAL_SERVICE_FAILURE, "Airport lookup is unavailable. Try again shortly."); }
};

export const stopRequestWhatsAppService = async (trackingId: string, contact: unknown) => {
  if (typeof contact !== "string" || !contact.trim()) CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Enter the original contact for this request.");
  const request = await Request.findOne({ trackingId: { $in: [trackingId, trackingId.toUpperCase(), trackingId.toLowerCase()] } });
  if (!request || request.contact.trim().toLowerCase() !== contact.trim().toLowerCase()) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.REQUEST_NOT_FOUND, "Request not found");
  await Request.updateOne({ _id: request._id }, { $set: { whatsappOptIn: false } });
};
