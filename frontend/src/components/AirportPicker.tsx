import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Plane, Check } from "lucide-react";
import api from "../services/api";
import { airports, type Airport } from "../data/airports";

export default function AirportPicker({label,value,onChange,remote=false,required=true}: {label:string;value:string;onChange:(value:string,code?:string)=>void;remote?:boolean;required?:boolean}) {
  const id=useId(); const root=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false); const [active,setActive]=useState(-1); const [online,setOnline]=useState<Airport[]>([]); const [loading,setLoading]=useState(false); const [failed,setFailed]=useState(false);
  const term=(value.match(/\(([A-Z]{3})\)$/)?.[1] || value).trim().toLowerCase();
  const local=airports.filter(a=>`${a.city} ${a.name} ${a.code} ${a.country}`.toLowerCase().includes(term));
  const options=[...local,...online.filter(a=>!local.some(b=>b.code===a.code))].slice(0,8);
  useEffect(()=>{ const close=(event:MouseEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);}; document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close);},[]);
  useEffect(()=>{
    if(!remote || !open || value.trim().length<2 || /\([A-Z]{3}\)$/.test(value))return;
    const controller=new AbortController();
    const timer=setTimeout(async()=>{setLoading(true);setFailed(false);try{const result=await api.get("/requests/airports",{params:{keyword:value.trim()},signal:controller.signal});setOnline(result.data.data);}catch{if(!controller.signal.aborted){setOnline([]);setFailed(true);}}finally{if(!controller.signal.aborted)setLoading(false);}},300);
    return()=>{clearTimeout(timer);controller.abort();};
  },[value,remote,open]);
  const select=(a:Airport)=>{onChange(`${a.city} (${a.code})`,a.code);setOpen(false);setActive(-1);setLoading(false);};
  return <div className="airport-picker" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}><label htmlFor={id}><MapPin size={17}/>{label}</label><input id={id} role="combobox" aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list" aria-activedescendant={open&&active>=0?`${id}-${active}`:undefined} autoComplete="off" required={required} placeholder="Search a city or airport" value={value} maxLength={100} onFocus={()=>setOpen(true)} onChange={e=>{onChange(e.target.value);setOnline([]);setLoading(false);setOpen(true);setActive(-1);}} onKeyDown={e=>{if(e.key==="Escape"){setOpen(false);return;}if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();setOpen(true);setActive(n=>e.key==="ArrowDown"?Math.min(n+1,options.length-1):Math.max(n-1,0));}if(e.key==="Enter"&&open&&active>=0&&options[active]){e.preventDefault();select(options[active]);}}}/>
    {open&&<div className="airport-options" id={`${id}-options`} role="listbox" aria-label={`${label} airports`}><span className="option-caption">{term?"MATCHING AIRPORTS":"POPULAR DEPARTURES"}</span>{options.map((a,i)=><button type="button" role="option" aria-selected={active===i} id={`${id}-${i}`} className={active===i?"option-active":""} key={a.code} onMouseDown={e=>e.preventDefault()} onClick={()=>select(a)}><Plane size={17}/><span><strong>{a.city}<small>{a.country}</small></strong><span>{a.name}</span></span><b>{a.code}</b>{value.endsWith(`(${a.code})`)&&<Check size={14}/>}</button>)}{loading&&<p role="status">Looking for more airports…</p>}{!options.length&&!loading&&<p>{remote?failed?"Airport lookup is unavailable. Try a common city or retry shortly.":"No airports found. Try a nearby city.":"Your city is welcome too. You can keep what you typed."}</p>}</div>}
  </div>;
}
