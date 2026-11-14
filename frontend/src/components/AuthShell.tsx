import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Plane } from "lucide-react";

export default function AuthShell({children,mode}:{children:ReactNode;mode:"login"|"register"}){
  return <div className="auth-experience"><section className="auth-scene"><Link className="brand auth-brand" to="/"><span className="brand-icon"><Plane size={22}/></span>flyeasy<span className="brand-dot">.</span></Link><div className="auth-scenery"/><div className="auth-scene-copy"><span className="eyebrow">A LITTLE CLOSER TO SOMEWHERE.</span><h2>Your travels.<br/>Beautifully <em>in sync.</em></h2><p>Every plan. Every conversation.<br/>Every “can’t wait to get there.”</p></div><div className="auth-scene-bottom"><div><span>ONE ACCOUNT.</span><strong>A world of possibilities.</strong></div><Plane size={29}/></div><span className="auth-scene-coordinate">06°34′ N &nbsp; 03°19′ E &nbsp; / &nbsp; NEXT STOP: ANYWHERE</span></section><section className="auth-form-side"><div className="auth-mini-nav"><Link to="/"><ArrowLeft size={15}/>Back to the journey</Link><Link to="/contact">Need a hand? <ArrowUpRight size={15}/></Link></div><div className="auth-form-content" key={mode}>{children}</div><p className="auth-form-footnote">A real person behind every journey.<span>Made personal. Made easy.</span></p></section></div>;
}
