import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateTrackingId() { return Array.from({length:6},()=>alphabet[crypto.randomInt(alphabet.length)]).join(""); }
export function contactMatches(stored: string, supplied: unknown) {
  return typeof supplied === "string" && supplied.trim().length>0 && stored.trim().toLowerCase()===supplied.trim().toLowerCase();
}
// Short references are never bearer credentials. Also limit public lookup attempts.
const attempts=new Map<string,{count:number;until:number}>();
export function trackingLimit(req: Request,res: Response,next: NextFunction) {
  const now=Date.now();const ip=req.ip || "unknown";
  if(attempts.size>10000)for(const [key,value] of attempts)if(value.until<now)attempts.delete(key);
  if(attempts.size>10000){res.status(429).json({message:"Please try again later."});return;}
  let entry=attempts.get(ip);
  if(!entry||entry.until<now){entry={count:0,until:now+15*60*1000};attempts.set(ip,entry);}
  entry.count++;
  if(entry.count>30){res.setHeader("Retry-After",Math.ceil((entry.until-now)/1000));res.status(429).json({message:"Too many tracking attempts. Please try again in 15 minutes."});return;}
  next();
}
