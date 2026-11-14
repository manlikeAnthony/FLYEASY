import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowUpRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { getNotifications, notificationKey, type NotificationItem } from "../services/notifications";
export default function NotificationBell(){
  const {user}=useAuth();const identity=user?.id||user?.email||user?.name||"account";
  const query=useQuery({queryKey:notificationKey(identity),queryFn:()=>getNotifications(),enabled:!!user,refetchInterval:15000,retry:false});
  const seen=useRef<{identity:string;latest:string}|null>(null);const [toast,setToast]=useState<NotificationItem|null>(null);
  useEffect(()=>{const latest=query.data?.items[0];if(!latest)return;if(seen.current?.identity===identity&&seen.current.latest!==latest._id&&!latest.readAt)setToast(latest);seen.current={identity,latest:latest._id};},[query.data,identity]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(null),9000);return()=>clearTimeout(timer);},[toast]);
  if(!user)return null;
  return <><Link to="/notifications" className="notification-bell icon-button" aria-label={`Notifications${query.data?.unread?`, ${query.data.unread} unread`:""}`}><Bell size={20}/>{!!query.data?.unread&&<span>{query.data.unread>99?"99+":query.data.unread}</span>}</Link>{toast&&<div className="notification-toast" role="status"><Bell size={23}/><Link to={toast.href} onClick={()=>setToast(null)}><strong>{toast.title}</strong><span>Open your journey <ArrowUpRight size={15}/></span></Link><button type="button" aria-label="Dismiss notification" onClick={()=>setToast(null)}><X size={17}/></button></div>}</>;
}
