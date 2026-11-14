import request from "supertest";
import app from "../src/app";
import Notification from "../src/notifications/notification.model";
import Preference from "../src/notifications/notificationPreference.model";
import FlightRequest from "../src/request/request.model";
import User from "../src/auth/user.model";
import Contact from "../src/contact/contact.model";
import { createAccessToken } from "../src/utils/jwt";
import { publishNotificationEvents, deliverPendingNotifications } from "../src/notifications/notification.processor";
import * as notificationProcessor from "../src/notifications/notification.processor";
import { sendNotificationEmail } from "../src/notifications/notification.delivery";

jest.mock("../src/notifications/notification.delivery",()=>({sendNotificationEmail:jest.fn(),sendNotificationWhatsApp:jest.fn()}));
const id="507f1f77bcf86cd799439011";
const userId="507f191e810c19729de860ea";
const cookie=(role:"ADMIN"|"USER"="USER")=>`accessToken=${createAccessToken({userId,role,name:"Test traveler"})}`;
const lean=(value:unknown)=>({lean:jest.fn().mockResolvedValue(value)});
beforeEach(()=>jest.spyOn(notificationProcessor,"processNotificationOutbox").mockResolvedValue(undefined));
afterEach(()=>{jest.restoreAllMocks();jest.clearAllMocks();});

describe("Notification access and settings",()=>{
  test("inbox requires authentication",async()=>{expect((await request(app).get("/api/v1/notifications")).status).toBe(401);});
  test("reading a notification is scoped to the recipient",async()=>{
    const update=jest.spyOn(Notification,"findOneAndUpdate").mockReturnValue({select:jest.fn().mockResolvedValue(null)} as never);
    expect((await request(app).patch(`/api/v1/notifications/${id}/read`).set("Cookie",cookie())).status).toBe(404);
    expect(update.mock.calls[0][0]).toEqual({_id:id,recipient:userId});
  });
  test("mark all read cannot modify another account",async()=>{
    const update=jest.spyOn(Notification,"updateMany").mockResolvedValue({modifiedCount:2} as never);
    expect((await request(app).patch("/api/v1/notifications/read-all").set("Cookie",cookie()).send({recipient:"someone-else"})).status).toBe(200);
    expect(update.mock.calls[0][0]).toEqual({recipient:userId,readAt:null});
  });
  test("WhatsApp cannot be enabled without explicit consent",async()=>{
    const update=jest.spyOn(Preference,"findOneAndUpdate");
    expect((await request(app).put("/api/v1/notifications/preferences").set("Cookie",cookie()).send({emailEnabled:true,whatsappEnabled:true,whatsappNumber:"+2347000000000",whatsappConsent:false})).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
  test("public contact points to the supplied owner",async()=>{
    jest.spyOn(Contact,"findOne").mockReturnValue(lean(null) as never);
    const response=await request(app).get("/api/v1/contact");
    expect(response.status).toBe(200);expect(response.body.data).toEqual({email:"daniellaonyejesi@gmail.com",whatsapp:"+2347041176870"});
  });
  test("customers cannot change the owner’s contacts",async()=>{
    expect((await request(app).put("/api/v1/contact").set("Cookie",cookie()).send({email:"attacker@example.com"})).status).toBe(403);
  });
  test("customers cannot inspect channel configuration",async()=>{expect((await request(app).get("/api/v1/notifications/channels").set("Cookie",cookie())).status).toBe(403);});
});

describe("Durable workflow events",()=>{
  test("sending a quote stores its notification event in the same atomic write",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue({_id:id,status:"pending"});
    const update=jest.spyOn(FlightRequest,"findOneAndUpdate").mockResolvedValue({_id:id});
    const response=await request(app).put(`/api/v1/requests/${id}/quote`).set("Cookie",cookie("ADMIN")).send({airline:"Test airline",amount:500000,currency:"NGN",details:"A flight proposal"});
    expect(response.status).toBe(200);
    expect(update.mock.calls[0][1]).toMatchObject({$set:{status:"processing","quote":{decision:"pending"}},$push:{notificationEvents:{kind:"quote.sent",actorId:userId,publishedAt:null,eventId:expect.any(String)}}});
  });
  test("quote acceptance queues an owner alert atomically",async()=>{
    const update=jest.spyOn(FlightRequest,"findOneAndUpdate").mockResolvedValue({_id:id});
    expect((await request(app).post(`/api/v1/requests/${id}/quote/decision`).set("Cookie",cookie()).send({decision:"accepted"})).status).toBe(200);
    expect(update.mock.calls[0][1]).toMatchObject({$set:{"quote.decision":"accepted"},$push:{notificationEvents:{kind:"quote.accepted",publishedAt:null}}});
  });
  test("publication failure leaves the durable event available for retry",async()=>{
    const event={eventId:"event-1",kind:"quote.sent",actorId:"an-admin",publishedAt:null};
    jest.spyOn(FlightRequest,"find").mockReturnValue({limit:()=>lean([{_id:id,user:userId,notificationEvents:[event]}])} as never);
    jest.spyOn(User,"findById").mockReturnValue({select:()=>lean({_id:userId,email:"customer@example.com"})} as never);
    jest.spyOn(Preference,"findOne").mockReturnValue(lean(null) as never);
    const insert=jest.spyOn(Notification,"updateOne").mockRejectedValue(new Error("Database unavailable"));
    const acknowledge=jest.spyOn(FlightRequest,"updateOne");
    await expect(publishNotificationEvents()).rejects.toThrow("Database unavailable");
    expect(insert.mock.calls[0][0]).toEqual({eventId:"event-1",recipientKey:userId});expect(acknowledge).not.toHaveBeenCalled();
  });
});

describe("External delivery queue",()=>{
  const previous={EMAIL_USER:process.env.EMAIL_USER,EMAIL_PASS:process.env.EMAIL_PASS,BREVO_API_KEY:process.env.BREVO_API_KEY};
  beforeEach(()=>{process.env.EMAIL_USER="sender@example.com";process.env.EMAIL_PASS="fixture-only";delete process.env.BREVO_API_KEY;});
  afterEach(()=>{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
  const job={_id:id,recipient:userId,title:"Your flight quote is ready",body:"Review your journey",href:`/workspace/${id}`,email:{to:"customer@example.com",attempts:1},whatsapp:{to:"",attempts:0}};
  const claim=()=>jest.spyOn(Notification,"findOneAndUpdate").mockReturnValueOnce({select:jest.fn().mockResolvedValue(job)} as never).mockReturnValue({select:jest.fn().mockResolvedValue(null)} as never);
  test("provider acceptance is recorded as submitted, not confirmed delivery",async()=>{
    claim();jest.spyOn(Preference,"findOne").mockReturnValue(lean({emailEnabled:true}) as never);
    const update=jest.spyOn(Notification,"updateOne").mockResolvedValue({} as never);
    jest.mocked(sendNotificationEmail).mockResolvedValue("provider-id");
    await deliverPendingNotifications();
    expect(sendNotificationEmail).toHaveBeenCalledWith("customer@example.com",job.title,job.body,job.href);
    expect(update.mock.calls[0][1]).toMatchObject({$set:{"email.status":"submitted","email.providerId":"provider-id"}});
  });
  test("provider errors schedule retry without exposing provider secrets",async()=>{
    claim();jest.spyOn(Preference,"findOne").mockReturnValue(lean(null) as never);
    const update=jest.spyOn(Notification,"updateOne").mockResolvedValue({} as never);
    jest.mocked(sendNotificationEmail).mockRejectedValue(new Error("secret-provider-response"));
    await deliverPendingNotifications();
    expect(update.mock.calls[0][1]).toMatchObject({$set:{"email.status":"pending","email.nextAttemptAt":expect.any(Date)}});
    expect(JSON.stringify(update.mock.calls)).not.toContain("secret-provider-response");
  });
  test("opting out cancels queued email before transmission",async()=>{
    claim();jest.spyOn(Preference,"findOne").mockReturnValue(lean({emailEnabled:false}) as never);
    const update=jest.spyOn(Notification,"updateOne").mockResolvedValue({} as never);
    await deliverPendingNotifications();
    expect(sendNotificationEmail).not.toHaveBeenCalled();expect(update.mock.calls[0][1]).toMatchObject({$set:{"email.status":"disabled"}});
  });
});

describe("Inbox privacy",()=>{
  test("inbox filters by the authenticated recipient and returns no delivery addresses",async()=>{
    const projection=jest.fn().mockReturnValue({lean:jest.fn().mockResolvedValue([])});
    const chain={sort:jest.fn(),skip:jest.fn(),limit:jest.fn(),select:projection};
    chain.sort.mockReturnValue(chain);chain.skip.mockReturnValue(chain);chain.limit.mockReturnValue(chain);
    const find=jest.spyOn(Notification,"find").mockReturnValue(chain as never);
    jest.spyOn(Notification,"countDocuments").mockResolvedValue(0);
    const response=await request(app).get("/api/v1/notifications?recipient=another-account").set("Cookie",cookie());
    expect(response.status).toBe(200);expect(find).toHaveBeenCalledWith({recipient:userId});
    expect(projection).toHaveBeenCalledWith("title body href kind readAt createdAt email.status whatsapp.status");
    expect(response.body.data.items).toEqual([]);
  });
});

describe("Guest WhatsApp controls",()=>{
  test("stopping WhatsApp requires the original contact, even with a known reference",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue({_id:id,contact:"+2347000000000"});
    const update=jest.spyOn(FlightRequest,"updateOne");
    expect((await request(app).post("/api/v1/requests/track/F7K2MP/stop-whatsapp").send({contact:"+2347111111111"})).status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });
  test("a guest can stop updates with their original contact",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue({_id:id,contact:"+2347000000000"});
    const update=jest.spyOn(FlightRequest,"updateOne").mockResolvedValue({} as never);
    expect((await request(app).post("/api/v1/requests/track/F7K2MP/stop-whatsapp").send({contact:"+2347000000000"})).status).toBe(200);
    expect(update).toHaveBeenCalledWith({_id:id},{$set:{whatsappOptIn:false}});
  });
});

describe("Notification recipient routing",()=>{
  test("a guest’s WhatsApp consent never routes an owner alert back to the guest",async()=>{
    jest.spyOn(FlightRequest,"find").mockReturnValue({limit:()=>lean([{_id:id,contact:"+2347000000000",whatsappOptIn:true,notificationEvents:[{eventId:"owner-event",kind:"request.created",publishedAt:null}]}])} as never);
    jest.spyOn(User,"find").mockReturnValue({select:()=>lean([])} as never);
    jest.spyOn(Contact,"findOne").mockReturnValue(lean({email:"owner@example.com",whatsapp:"+2347111111111"}) as never);
    const insert=jest.spyOn(Notification,"updateOne").mockResolvedValue({} as never);
    jest.spyOn(FlightRequest,"updateOne").mockResolvedValue({} as never);
    await publishNotificationEvents();
    expect(insert.mock.calls[0][1]).toMatchObject({$setOnInsert:{email:{to:"owner@example.com",status:"pending"},whatsapp:{to:"",status:"disabled"}}});
  });
});
