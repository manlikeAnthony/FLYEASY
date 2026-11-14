import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import RequestTable from "../components/RequestTable";
import type { FlightRequest } from "../types/requests";
export default function AdminRequestsPage() {
  const [search,setSearch]=useState(""); const [status,setStatus]=useState(""); const [page,setPage]=useState(1);
  const {data,isLoading,isError,refetch}=useQuery({queryKey:["admin-requests",search,status,page],queryFn:async()=> (await api.get("/requests",{params:{search,status:status || undefined,page,limit:20}})).data,refetchInterval:30000});
  const items=(data?.data || []) as FlightRequest[];
  return <><div className="workspace-heading"><div><span className="eyebrow">YOUR BOOKING DESK</span><h1>Let’s get them there.</h1><p>Manage requests, share flight options, and keep every traveler updated.</p></div></div><section className="panel"><div className="workspace-fields"><label>Search requests<input type="search" placeholder="Name, departure, or destination" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label><label>Status<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">All requests</option><option value="pending">Pending</option><option value="processing">In progress</option><option value="completed">Booked</option><option value="rejected">Rejected</option></select></label></div>{isError ? <div className="error-state">Couldn’t load requests. <button onClick={()=>refetch()} className="underline">Retry</button></div> : isLoading ? <p className="muted" role="status">Loading requests…</p> : <RequestTable items={items}/>}
  <div style={{display:"flex",justifyContent:"space-between",marginTop:20,fontSize:11}}><button disabled={page===1 || isLoading} onClick={()=>setPage(p=>p-1)}>← Previous</button><span className="muted">Page {page}</span><button disabled={items.length<20 || isLoading || isError} onClick={()=>setPage(p=>p+1)}>Next →</button></div></section></>;
}
