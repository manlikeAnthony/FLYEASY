let cached: { token: string; until: number; base: string; key: string } | undefined;
export function amadeusBase() { return process.env.AMADEUS_ENV === "production" ? "https://api.amadeus.com" : "https://test.api.amadeus.com"; }
export async function amadeusToken() {
  const key=process.env.AMADEUS_CLIENT_ID; const secret=process.env.AMADEUS_CLIENT_SECRET;
  if(!key||!secret)throw new Error("Amadeus credentials are missing");
  const base=amadeusBase();
  if(cached&&cached.until>Date.now()&&cached.base===base&&cached.key===key)return cached.token;
  const result=await fetch(`${base}/v1/security/oauth2/token`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:key,client_secret:secret}),signal:AbortSignal.timeout(15000)});
  if(!result.ok)throw new Error("Provider authentication failed");
  const data=await result.json() as {access_token:string;expires_in:number};
  cached={token:data.access_token,until:Date.now()+Math.max(0,data.expires_in-60)*1000,base,key};
  return data.access_token;
}
