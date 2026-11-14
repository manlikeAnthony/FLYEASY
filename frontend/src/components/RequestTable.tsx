import { Link } from "react-router-dom";
import { Plane, ArrowUpRight } from "lucide-react";
import type { FlightRequest } from "../types/requests";
export function StatusBadge({status = "pending"}: {status?: string}) { return <span className={`status-badge status-${status}`}>{status === "completed" ? "Booked" : status === "processing" ? "In progress" : status}</span>; }
export default function RequestTable({items}: {items: FlightRequest[]}) {
  if (!items.length) return <div className="empty-state"><Plane size={30}/><h2>Your next journey starts here</h2><p>No requests to show yet. When a flight is requested, it will appear here.</p><Link to="/book" className="text-link" style={{justifyContent:"center"}}>Request a flight <ArrowUpRight size={16}/></Link></div>;
  return <div className="table-wrap"><table className="request-table"><thead><tr><th>Journey</th><th>Traveler</th><th>Departure</th><th>Status</th><th>Details</th></tr></thead><tbody>{items.map(item=><tr key={item._id || item.trackingId}><td><strong>{item.from} → {item.to}</strong><small>Reference {item.trackingId}</small></td><td>{item.name}</td><td>{new Date(item.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td><td><StatusBadge status={item.status}/></td><td><Link to={`/workspace/${item._id}`}>Open request ↗</Link></td></tr>)}</tbody></table></div>;
}
