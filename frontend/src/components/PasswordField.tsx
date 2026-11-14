import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function PasswordField({newPassword=false}:{newPassword?:boolean}){
  const id=useId();
  const [visible,setVisible]=useState(false);
  return <div className="auth-field"><label htmlFor={id}>Password</label><div className="password-input-wrap"><input id={id} name="password" required minLength={6} type={visible?"text":"password"} autoComplete={newPassword?"new-password":"current-password"} placeholder={newPassword?"Create a password":"Your password"}/><button type="button" aria-label={visible?"Hide password":"Show password"} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{newPassword&&<small>At least 6 characters. Make it one only you know.</small>}</div>;
}
