import request from "supertest";
import app from "../src/app";
import FlightRequest from "../src/request/request.model";
import { createAccessToken } from "../src/utils/jwt";
import * as notificationProcessor from "../src/notifications/notification.processor";

const id = "507f1f77bcf86cd799439011";
const userId = "507f191e810c19729de860ea";
const cookie = (role: "ADMIN" | "USER" = "USER") => `accessToken=${createAccessToken({userId,role,name:"Test traveler"})}`;

beforeEach(()=>jest.spyOn(notificationProcessor,"processNotificationOutbox").mockResolvedValue(undefined));
afterEach(()=>jest.restoreAllMocks());

describe("Request workspace authorization",()=>{
  test.each(["put","delete"] as const)("%s request requires authentication",async method=>{
    expect((await request(app)[method](`/api/v1/requests/${id}`).send({status:"completed"})).status).toBe(401);
  });
  test.each(["put","delete"] as const)("%s request blocks customer roles",async method=>{
    expect((await request(app)[method](`/api/v1/requests/${id}`).set("Cookie",cookie()).send({status:"completed"})).status).toBe(403);
  });
  test("customer workspace lookup is scoped to their account",async()=>{
    const lookup=jest.spyOn(FlightRequest,"findOne").mockResolvedValue(null);
    const result=await request(app).get(`/api/v1/requests/${id}/workspace`).set("Cookie",cookie());
    expect(result.status).toBe(404);
    expect(lookup).toHaveBeenCalledWith({_id:id,user:userId});
  });
  test("admin workspace lookup can access any request",async()=>{
    const lookup=jest.spyOn(FlightRequest,"findOne").mockResolvedValue({from:"Lagos",to:"Abuja"});
    const result=await request(app).get(`/api/v1/requests/${id}/workspace`).set("Cookie",cookie("ADMIN"));
    expect(result.status).toBe(200);expect(lookup).toHaveBeenCalledWith({_id:id});
  });
  test("message validation rejects blank input before touching database",async()=>{
    const lookup=jest.spyOn(FlightRequest,"findOne");
    expect((await request(app).post(`/api/v1/requests/${id}/messages`).set("Cookie",cookie()).send({text:"  "})).status).toBe(400);
    expect(lookup).not.toHaveBeenCalled();
  });
  test("customers cannot send quotes",async()=>{
    expect((await request(app).put(`/api/v1/requests/${id}/quote`).set("Cookie",cookie()).send({airline:"Test",amount:100,currency:"NGN",details:"Flight"})).status).toBe(403);
  });
  test("quote decision is atomic and scoped to request owner",async()=>{
    const update=jest.spyOn(FlightRequest,"findOneAndUpdate").mockResolvedValue(null);
    const result=await request(app).post(`/api/v1/requests/${id}/quote/decision`).set("Cookie",cookie()).send({decision:"accepted"});
    expect(result.status).toBe(409);expect(update.mock.calls[0][0]).toEqual({_id:id,user:userId,status:"processing","quote.decision":"pending"});
  });
  test("quote rejects invalid amounts",async()=>{
    expect((await request(app).put(`/api/v1/requests/${id}/quote`).set("Cookie",cookie("ADMIN")).send({airline:"Test",amount:-1,currency:"NGN",details:"Trip"})).status).toBe(400);
  });
  test("flight search is admin only",async()=>{
    expect((await request(app).get("/api/v1/requests/flight-search").set("Cookie",cookie())).status).toBe(403);
  });
  test("flight search validates airport codes",async()=>{
    expect((await request(app).get("/api/v1/requests/flight-search?origin=Lagos&destination=LHR&date=2030-12-01").set("Cookie",cookie("ADMIN"))).status).toBe(400);
  });
  test("flight search reports missing setup rather than fabricated fares",async()=>{
    const oldKey=process.env.AMADEUS_CLIENT_ID;delete process.env.AMADEUS_CLIENT_ID;
    try {expect((await request(app).get("/api/v1/requests/flight-search?origin=LOS&destination=LHR&date=2030-12-01").set("Cookie",cookie("ADMIN"))).status).toBe(503);}finally{if(oldKey)process.env.AMADEUS_CLIENT_ID=oldKey;}
  });
  test("invalid trip cannot be submitted",async()=>{
    expect((await request(app).post("/api/v1/requests").send({name:"Test",from:"LOS",to:"LOS",contact:"test@example.com",date:"2030-12-01"})).status).toBe(400);
  });
  test("public tracking omits contact details and conversations",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue({name:"Private",contact:"private@example.com",messages:[{text:"Private conversation"}],quote:{amount:100},from:"LOS",to:"ABV",date:"2030-12-01",status:"pending",trackingId:"test"});
    const response=await request(app).post("/api/v1/requests/track/test").send({contact:"private@example.com"});
    expect(response.status).toBe(200);expect(response.body.data).not.toHaveProperty("contact");expect(response.body.data).not.toHaveProperty("messages");expect(response.body.data).not.toHaveProperty("quote");
  });
});

describe("Short tracking references",()=>{
  test("new requests receive a six-character reference and are attached to the signed-in traveler",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue(null);
    const create=jest.spyOn(FlightRequest,"create").mockImplementation((async(data: Record<string,unknown>)=>({...data,_id:id,status:"pending"})) as never);
    const result=await request(app).post("/api/v1/requests").set("Cookie",cookie()).send({name:"Traveler",from:"Lagos",to:"Abuja",contact:"traveler@example.com",date:"2030-12-01"});
    expect(result.status).toBe(201);expect(result.body.trackingId).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(String((create.mock.calls[0][0] as unknown as {user:unknown}).user)).toBe(userId);
  });
  test("a duplicate reference collision is retried",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue(null);
    const create=jest.spyOn(FlightRequest,"create").mockRejectedValueOnce({code:11000}).mockImplementationOnce((async(data: Record<string,unknown>)=>({...data,_id:id,status:"pending"})) as never);
    const result=await request(app).post("/api/v1/requests").send({name:"Guest",from:"Lagos",to:"Abuja",contact:"guest@example.com",date:"2030-12-01"});
    expect(result.status).toBe(201);expect(create).toHaveBeenCalledTimes(2);
  });
  test("a short reference alone cannot retrieve a trip",async()=>{
    const lookup=jest.spyOn(FlightRequest,"findOne");
    expect((await request(app).get("/api/v1/requests/track/F7K2MP")).status).toBe(400);
    expect(lookup).not.toHaveBeenCalled();
  });
  test("short-reference lookup verifies the original contact",async()=>{
    jest.spyOn(FlightRequest,"findOne").mockResolvedValue({trackingId:"F7K2MP",contact:"guest@example.com",from:"Lagos",to:"Abuja",status:"pending"});
    expect((await request(app).post("/api/v1/requests/track/F7K2MP").send({contact:"someoneelse@example.com"})).status).toBe(404);
    expect((await request(app).post("/api/v1/requests/track/F7K2MP").send({contact:"GUEST@example.com"})).status).toBe(200);
  });
  test("claiming a short reference requires the original contact in the atomic ownership update",async()=>{
    const update=jest.spyOn(FlightRequest,"findOneAndUpdate").mockResolvedValue({_id:id});
    const result=await request(app).post("/api/v1/requests/claim/F7K2MP").set("Cookie",cookie()).send({contact:"guest@example.com"});
    expect(result.status).toBe(200);expect(update.mock.calls[0][0]).toMatchObject({trackingId:{$in:["F7K2MP","F7K2MP","f7k2mp"]},contact:{$regex:"^guest@example\\.com$",$options:"i"}});
  });
  test("worldwide airport lookup is restricted to administrators",async()=>{
    expect((await request(app).get("/api/v1/requests/airports?keyword=Lagos").set("Cookie",cookie())).status).toBe(403);
  });
});

describe("Airport name lookup",()=>{
  test("returns city and airport names while keeping provider credentials on the server",async()=>{
    const previousKey=process.env.AMADEUS_CLIENT_ID;const previousSecret=process.env.AMADEUS_CLIENT_SECRET;
    process.env.AMADEUS_CLIENT_ID="airport-lookup-fixture";process.env.AMADEUS_CLIENT_SECRET="fixture-only";
    const provider=jest.spyOn(globalThis,"fetch").mockResolvedValueOnce(Response.json({access_token:"fixture-token",expires_in:600})).mockResolvedValueOnce(Response.json({data:[{iataCode:"DUB",name:"DUBLIN AIRPORT",address:{cityName:"DUBLIN",countryName:"IRELAND"}}]}));
    try{
      const result=await request(app).get("/api/v1/requests/airports?keyword=Dublin").set("Cookie",cookie("ADMIN"));
      expect(result.status).toBe(200);expect(result.body.data).toEqual([{code:"DUB",city:"DUBLIN",name:"DUBLIN AIRPORT",country:"IRELAND"}]);
      expect(String(provider.mock.calls[1][0])).toContain("keyword=Dublin");
      expect(JSON.stringify(result.body)).not.toContain("fixture-only");
    }finally{
      if(previousKey===undefined)delete process.env.AMADEUS_CLIENT_ID;else process.env.AMADEUS_CLIENT_ID=previousKey;
      if(previousSecret===undefined)delete process.env.AMADEUS_CLIENT_SECRET;else process.env.AMADEUS_CLIENT_SECRET=previousSecret;
    }
  });
});
