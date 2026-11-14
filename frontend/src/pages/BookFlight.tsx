import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RequestForm from "../components/RequestForm";
export default function BookFlight() {
  const {user}=useAuth();const {pathname,search}=useLocation();
  if(user&&pathname==="/book")return <Navigate to={`/my/new${search}`} replace/>;
  return <div className="booking-page"><div className="booking-page-heading"><span className="eyebrow">{user?"YOUR WORKSPACE / NEW JOURNEY":"A MORE PERSONAL WAY TO FLY"}</span><h1>A little daydream.<br/>A <em>real departure.</em></h1><p>Big plans start small. Let’s make yours happen.</p></div><RequestForm/></div>;
}
