import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Headphones, Plane, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useReveal } from "../hooks/useReveal";

const destinations = [
  {city:"London",country:"United Kingdom",note:"For a change of scenery.",image:"photo-1513635269975-59663e0ac1ad"},
  {city:"Dubai",country:"United Arab Emirates",note:"For a little more extraordinary.",image:"photo-1512453979798-5ea266f8880c"},
  {city:"Cape Town",country:"South Africa",note:"For the moments in between.",image:"photo-1580060839134-75a5edca2e99"},
];
export default function Home() {
  const {user}=useAuth(); const requestPath=user?"/my/new":"/book"; const hero=useRef<HTMLElement>(null);
  useReveal();
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let frame=0; const scroll=()=>{if(!frame)frame=requestAnimationFrame(()=>{hero.current?.style.setProperty("--hero-drift",`${Math.min(window.scrollY*.18,170)}px`);frame=0;});};
    window.addEventListener("scroll",scroll,{passive:true});return()=>{window.removeEventListener("scroll",scroll);cancelAnimationFrame(frame);};
  },[]);
  return <>
    <section className="editorial-hero" ref={hero}>
      <div className="editorial-landscape"/><div className="hero-grain"/>
      <div className="editorial-hero-copy"><span className="eyebrow light-eyebrow"><span className="live-dot"/> MADE OF PLACES. MADE FOR YOU.</span>
        <h1><span>Go somewhere</span><span>that stays</span><span>with <em>you.</em></span></h1>
        <div className="hero-copy-bottom"><p>The window seat. The new city. That feeling.<br/>You chase the moments. We’ll handle the flight.</p><Link className="circle-cta" to={requestPath} aria-label="Start your flight request"><ArrowUpRight size={30}/></Link></div>
      </div>
      <div className="sky-route" aria-hidden="true"><svg viewBox="0 0 500 600" fill="none"><path className="route-track" d="M80 530C480 500 80 50 430 80"/><path className="route-progress" d="M80 530C480 500 80 50 430 80"/><circle cx="80" cy="530" r="6"/><circle cx="430" cy="80" r="6"/></svg><Plane className="route-airplane" size={31}/><span className="route-start">HERE</span><span className="route-end">SOMEWHERE NEW</span></div>
      <div className="hero-bottomline"><a href="#possibilities">A world waiting to happen <ArrowDown size={17}/></a><span>FLIGHT REQUESTS, WITH A HUMAN TOUCH.</span></div>
    </section>
    <section className="open-invitation" data-reveal><div><span className="eyebrow">LESS SEARCHING. MORE GOING.</span><h2>Where’s your <em>next?</em></h2></div><p>A destination, a date, a little daydream.<br/>Tell us your plans. We’ll take it from there.</p><Link className="ink-button" to={requestPath}>Let’s plan a flight <ArrowUpRight size={20}/></Link></section>
    <div className="destination-marquee" aria-hidden="true"><div>{[0,1].map(i=><span key={i}>LAGOS <i>✦</i> LONDON <i>✦</i> DUBAI <i>✦</i> ACCRA <i>✦</i> CAPE TOWN <i>✦</i> EVERYWHERE <i>✦</i> </span>)}</div></div>
    <section className="editorial-destinations" id="possibilities"><div className="editorial-section-title" data-reveal><div><span className="eyebrow">FOLLOW YOUR CURIOSITY</span><h2>Some places just<br/><em>stay with you.</em></h2></div><p>New perspectives. Familiar faces. A long-overdue escape.<br/>Whatever takes you there, we’ll help you get there.</p></div>
      <div className="editorial-destination-grid">{destinations.map((d,i)=><Link className={`editorial-destination destination-${i}`} to={`${requestPath}?to=${encodeURIComponent(d.city)}`} key={d.city} data-reveal><div className="destination-photo"><img src={`https://images.unsplash.com/${d.image}?auto=format&fit=crop&w=1000&q=85`} alt={`${d.city}, ${d.country}`} loading="lazy"/><span className="photo-explore"><ArrowUpRight size={28}/></span><span className="destination-number">0{i+1}</span></div><div className="destination-description"><div><span>{d.country}</span><h3>{d.city}</h3></div><ArrowUpRight size={22}/></div><p>{d.note}</p></Link>)}</div>
    </section>
    <section className="personal-section" id="how-it-works"><div className="personal-image" data-reveal><img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1100&q=85" alt="Sunlight over the clouds from an airplane window" loading="lazy"/><span>THE JOURNEY IS PART OF THE STORY.</span><div className="personal-stamp"><Plane size={29}/><span>PERSONALLY<br/>ARRANGED</span></div></div><div className="personal-copy" data-reveal><span className="eyebrow">A REAL PERSON. IN YOUR CORNER.</span><h2>Consider the<br/>details <em>handled.</em></h2><p>No endless tabs. No wondering what happens next. Just you, your plans, and a travel expert who gets it.</p><div className="editorial-steps">{[{icon:<Compass size={20}/>,title:"Dream it up.",text:"Pick your destination and dates. We’ll find options that fit."},{icon:<Headphones size={20}/>,title:"Make it yours.",text:"Chat with your expert, review the quote, and give us the go-ahead."},{icon:<ShieldCheck size={20}/>,title:"Enjoy the journey.",text:"Follow every update in your workspace. We’ll confirm when you’re booked."}].map(s=><div key={s.title}>{s.icon}<div><h3>{s.title}</h3><p>{s.text}</p></div></div>)}</div><Link className="text-link" to={requestPath}>Meet your next adventure <ArrowRight size={19}/></Link></div></section>
    <section className="editorial-finale" data-reveal><span className="eyebrow">SOMEWHERE IS CALLING.</span><h2>Take the <em>scenic</em><br/>route to your next.</h2><Link to={requestPath} className="finale-link"><span>Let’s make it happen</span><span className="circle-cta"><ArrowUpRight size={30}/></span></Link><div className="finale-wordmark" aria-hidden="true">flyeasy.</div></section>
  </>;
}
